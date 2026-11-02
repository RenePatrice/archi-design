'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getPayload } from 'payload'

import { routing, type Locale } from '@/i18n/routing'
import { notifyRequest } from '@/lib/email/notify'
import { isRateLimited } from '@/lib/rate-limit'
import { contactSchema, type ContactErrorKey, type ContactState } from '@/lib/schemas/contact'

/**
 * Enregistre un message de contact.
 * Étapes : piège à robots, limitation de débit, validation Zod, enregistrement en base.
 * Puis, après la réponse au visiteur : e-mail à l'entreprise et accusé de réception (modèle « contact »).
 */
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // 1. Champ invisible : un humain le laisse vide, un robot le remplit
  if (formData.get('website')) return { status: 'success', whatsappText: '' }

  // 2. Limitation de débit par adresse IP
  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'inconnue'
  if (isRateLimited(`contact:${ip}`)) return { status: 'error', reason: 'rateLimit', fieldErrors: {} }

  // 3. Validation
  const parsed = contactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, ContactErrorKey>> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0])
      fieldErrors[field] ??= issue.message as ContactErrorKey
    }
    return { status: 'error', reason: 'invalid', fieldErrors }
  }
  const data = parsed.data
  const locale = routing.locales.find((l) => l === formData.get('locale')) ?? routing.defaultLocale

  // 4. Enregistrement (le message est conservé même si l'envoi d'e-mail échoue plus tard)
  try {
    const payload = await getPayload({ config })
    let poleId: number | undefined
    if (data.pole) {
      const { docs } = await payload.find({ collection: 'poles', where: { key: { equals: data.pole } }, limit: 1, depth: 0 })
      poleId = docs[0]?.id
    }
    const poleTitle = poleId ? (await payload.findByID({ collection: 'poles', id: poleId, depth: 0, locale: 'fr' })).title : null
    await payload.create({
      collection: 'contact-messages',
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        city: data.city || undefined,
        pole: poleId,
        preferredContact: data.preferredContact,
        subject: data.subject,
        message: data.message,
        consent: true,
        locale,
        sourcePage: requestHeaders.get('referer')?.slice(0, 300) ?? undefined,
      },
    })

    // E-mails envoyés après la réponse, pour que la confirmation s'affiche immédiatement
    const rows = (lang: Locale) =>
      [
        { label: lang === 'fr' ? 'Objet' : 'Subject', value: data.subject },
        { label: 'Message', value: data.message },
        { label: lang === 'fr' ? 'Pôle concerné' : 'Division', value: poleTitle ?? '' },
        { label: lang === 'fr' ? 'Ville' : 'City', value: data.city },
        { label: 'E-mail', value: data.email },
      ].filter((r) => r.value)
    const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Conakry' }).format(new Date())
    const base = { number: null, date, customerName: data.name, customerPhone: data.phone }
    after(() =>
      notifyRequest({
        payload,
        service: 'contact',
        locale,
        customerEmail: data.email || null,
        companyData: { ...base, serviceLabel: 'Nouveau message', rows: rows('fr') },
        customerData: { ...base, serviceLabel: locale === 'fr' ? 'Votre message' : 'Your message', rows: rows(locale) },
        ackLabels:
          locale === 'fr'
            ? { number: '', summary: 'Votre message', whatsapp: 'Nous écrire sur WhatsApp', product: '', qty: '', unitPrice: '', subtotal: '', total: '' }
            : { number: '', summary: 'Your message', whatsapp: 'Message us on WhatsApp', product: '', qty: '', unitPrice: '', subtotal: '', total: '' },
      }),
    )
  } catch (error) {
    console.error('[contact] Enregistrement impossible', error)
    return { status: 'error', reason: 'server', fieldErrors: {} }
  }

  // Récapitulatif pour le bouton « Envoyer aussi sur WhatsApp »
  const whatsappText = [`${data.subject}`, data.message, `— ${data.name}, ${data.phone}${data.city ? `, ${data.city}` : ''}`].join('\n\n')
  return { status: 'success', whatsappText }
}
