import 'server-only'

import config from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'
import { generatePayloadCookie } from 'payload/shared'
import { cache } from 'react'

import type { User } from '@/payload-types'

/*
 * Session de l'espace client. On réutilise l'authentification de Payload :
 * même cookie que le back-office (« payload-token », httpOnly), mêmes protections
 * (mots de passe hachés, blocage après 5 essais).
 */

/** Utilisateur connecté (ou null), lu une seule fois par rendu. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return (user as User | null) ?? null
})

/** Pose le cookie de session après une connexion réussie. */
export async function setSessionCookie(token: string) {
  const payload = await getPayload({ config })
  const cookie = generatePayloadCookie({
    collectionAuthConfig: payload.collections.users.config.auth,
    cookiePrefix: payload.config.cookiePrefix,
    token,
    returnCookieAsObject: true,
  })
  ;(await cookies()).set(cookie.name, cookie.value ?? '', {
    httpOnly: true,
    path: cookie.path ?? '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
  })
}

export async function clearSessionCookie() {
  const payload = await getPayload({ config })
  ;(await cookies()).delete(`${payload.config.cookiePrefix}-token`)
}
