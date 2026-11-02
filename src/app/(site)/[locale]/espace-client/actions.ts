'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { z } from 'zod'

import { routing, type Locale } from '@/i18n/routing'
import { clearSessionCookie, getCurrentUser, setSessionCookie } from '@/lib/client-auth'
import { isRateLimited } from '@/lib/rate-limit'
import { localizedPath } from '@/lib/seo'

export type ClientActionState = { status: 'idle' } | { status: 'success' } | { status: 'error'; error: string }

const ip = async () => {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'inconnue'
}
const localeOf = (formData: FormData): Locale => routing.locales.find((l) => l === formData.get('locale')) ?? routing.defaultLocale

/** Connexion à l'espace client. */
export async function login(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
  if (isRateLimited(`login:${await ip()}`, 10)) return { status: 'error', error: 'rateLimit' }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { status: 'error', error: 'credentials' }

  const payload = await getPayload({ config })
  try {
    const result = await payload.login({ collection: 'users', data: { email, password } })
    if (!result.token) return { status: 'error', error: 'credentials' }
    await setSessionCookie(result.token)
  } catch (error) {
    // Message volontairement vague : on ne révèle pas si l'adresse existe
    const name = error instanceof Error ? error.name : ''
    return { status: 'error', error: name === 'LockedAuth' ? 'locked' : 'credentials' }
  }
  redirect(localizedPath(localeOf(formData), '/espace-client'))
}

export async function logout(formData: FormData) {
  await clearSessionCookie()
  redirect(localizedPath(localeOf(formData), '/espace-client'))
}

/** Envoie le lien de réinitialisation. Répond toujours « envoyé » pour ne rien révéler. */
export async function requestPasswordReset(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
  if (isRateLimited(`forgot:${await ip()}`, 5)) return { status: 'error', error: 'rateLimit' }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (z.email().safeParse(email).success) {
    const payload = await getPayload({ config })
    await payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: false }).catch(() => {})
  }
  return { status: 'success' }
}

/** Nouveau mot de passe à partir du lien reçu par e-mail, puis connexion automatique. */
export async function resetPassword(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
  if (isRateLimited(`reset:${await ip()}`, 10)) return { status: 'error', error: 'rateLimit' }
  const token = String(formData.get('token') ?? '')
  const password = String(formData.get('password') ?? '')
  if (password.length < 8 || password.length > 200) return { status: 'error', error: 'password' }
  if (password !== formData.get('confirm')) return { status: 'error', error: 'mismatch' }

  const payload = await getPayload({ config })
  try {
    const result = await payload.resetPassword({ collection: 'users', data: { token, password }, overrideAccess: true })
    if (result.token) await setSessionCookie(result.token)
  } catch {
    return { status: 'error', error: 'token' }
  }
  redirect(localizedPath(localeOf(formData), '/espace-client'))
}

/** Message du client à l'équipe, après vérification qu'il fait partie du projet. */
export async function sendClientMessage(_prev: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const user = await getCurrentUser()
  if (!user) return { status: 'error', error: 'forbidden' }
  if (isRateLimited(`message:${user.id}`, 20)) return { status: 'error', error: 'rateLimit' }

  const body = String(formData.get('body') ?? '').trim()
  if (body.length < 2 || body.length > 4000) return { status: 'error', error: 'message' }
  const projectId = Number(formData.get('projectId'))

  const payload = await getPayload({ config })
  // Lecture avec les droits du client : renvoie le projet seulement s'il en fait partie
  const { docs } = await payload.find({
    collection: 'client-projects',
    where: { id: { equals: projectId } },
    user,
    overrideAccess: false,
    limit: 1,
    depth: 0,
  })
  if (!docs[0]) return { status: 'error', error: 'forbidden' }

  await payload.create({
    collection: 'project-messages',
    data: { clientProject: projectId, body, author: user.id, fromStaff: false },
    overrideAccess: true,
  })
  return { status: 'success' }
}
