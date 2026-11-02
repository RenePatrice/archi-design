import 'server-only'

import path from 'node:path'

import { render } from '@react-email/render'
import type { Payload } from 'payload'

import { CompanyRequestEmail, CustomerAckEmail, type RequestEmailData } from '@/emails/request-emails'
import type { Locale } from '@/i18n/routing'
import type { RequestService } from '@/lib/requests/services'
import { siteUrl } from '@/lib/seo'
import { buildWhatsAppLink } from '@/lib/whatsapp'

import { fillPlaceholders } from './placeholders'
import { emailFrom, sendEmail } from './transport'

/** Pièces jointes au-delà de ce total : on les liste seulement (les boîtes refusent souvent > 20 Mo). */
const MAX_ATTACHMENTS_BYTES = 15 * 1024 * 1024
const RETRY_DELAYS_MS = [0, 3_000, 15_000]

export type NotifyInput = {
  payload: Payload
  service: RequestService
  locale: Locale
  /** Récapitulatif en français pour l'entreprise */
  companyData: RequestEmailData
  /** Récapitulatif dans la langue du client pour l'accusé de réception */
  customerData: RequestEmailData
  customerEmail?: string | null
  /** Valeur de {type} dans l'objet, ex. « villa » */
  typeLabel?: string
  /** Valeur de {formation} dans l'objet */
  trainingLabel?: string
  files?: { filename: string; filesize?: number | null; mimeType?: string | null }[]
  ackLabels: { number: string; summary: string; whatsapp: string; product: string; qty: string; unitPrice: string; subtotal: string; total: string }
  /** Commande à mettre à jour avec le résultat de l'envoi */
  orderId?: number
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function withRetry(send: () => Promise<void>): Promise<{ ok: boolean; attempts: number; error?: string }> {
  let lastError = ''
  for (const [index, delay] of RETRY_DELAYS_MS.entries()) {
    await wait(delay)
    try {
      await send()
      return { ok: true, attempts: index + 1 }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }
  return { ok: false, attempts: RETRY_DELAYS_MS.length, error: lastError }
}

/**
 * Envoie l'e-mail à l'entreprise (modèle du service) et l'accusé de réception au client.
 * Ne lève jamais d'erreur : le résultat est enregistré sur la commande pour suivi.
 */
export async function notifyRequest(input: NotifyInput): Promise<void> {
  const { payload, service, locale } = input
  try {
    const [templates, settings] = await Promise.all([
      payload.find({ collection: 'email-templates', where: { service: { equals: service } }, locale, limit: 1, depth: 0 }),
      payload.findGlobal({ slug: 'site-settings', locale, depth: 0 }),
    ])
    const template = templates.docs[0]

    const recipients = template?.recipients?.map((r) => r.email).filter(Boolean) ?? []
    if (recipients.length === 0) recipients.push(settings.defaultInbox || emailFrom.address)

    const values = {
      numero: input.companyData.number,
      client: input.companyData.customerName,
      type: input.typeLabel,
      formation: input.trainingLabel,
      date: input.companyData.date,
    }

    // Pièces jointes : fichiers enregistrés dans private-uploads/
    const files = input.files ?? []
    const totalSize = files.reduce((sum, f) => sum + (f.filesize ?? 0), 0)
    const attachments =
      totalSize <= MAX_ATTACHMENTS_BYTES
        ? files.map((f) => ({ filename: f.filename, path: path.resolve(process.cwd(), 'private-uploads', f.filename), contentType: f.mimeType ?? undefined }))
        : []

    // 1. E-mail à l'entreprise
    const phoneDigits = input.companyData.customerPhone.replace(/\D/g, '')
    const companyElement = CompanyRequestEmail({
      data: input.companyData,
      intro: template?.intro ? fillPlaceholders(template.intro, values) : null,
      whatsappUrl: buildWhatsAppLink(
        phoneDigits,
        `Bonjour ${input.companyData.customerName}, ARCHI-DESIGN vous contacte au sujet de votre demande ${input.companyData.number ?? ''}.`.replace(' .', '.'),
      ),
      callUrl: `tel:+${phoneDigits}`,
      attachmentNames: files.map((f) => f.filename),
      adminUrl: input.orderId ? `${siteUrl}/admin/collections/orders/${input.orderId}` : null,
    })
    const subject = fillPlaceholders(template?.subject ?? `[ARCHI-DESIGN] Nouvelle demande {numero}`, values)
    const company = await withRetry(async () =>
      sendEmail({
        to: recipients,
        subject,
        html: await render(companyElement),
        text: await render(companyElement, { plainText: true }),
        replyTo: input.customerEmail || undefined,
        attachments,
      }),
    )

    // 2. Accusé de réception au client (seulement s'il a donné un e-mail)
    let customer: { ok: boolean; attempts: number; error?: string } | null = null
    if (input.customerEmail && template) {
      const contactLines = [settings.companyName, settings.phone, settings.email, settings.address].filter(Boolean).join('\n')
      const ackElement = CustomerAckEmail({
        data: input.customerData,
        lang: locale,
        intro: fillPlaceholders(template.ackIntro, values),
        delay: template.ackDelay,
        outro: template.ackOutro,
        labels: input.ackLabels,
        companyWhatsappUrl: buildWhatsAppLink(settings.whatsappNumber, input.customerData.number ?? undefined),
        companyContact: contactLines,
      })
      customer = await withRetry(async () =>
        sendEmail({
          to: input.customerEmail!,
          subject: fillPlaceholders(template.ackSubject, values),
          html: await render(ackElement),
          text: await render(ackElement, { plainText: true }),
          replyTo: recipients[0],
        }),
      )
    }

    if (input.orderId) {
      await payload.update({
        collection: 'orders',
        id: input.orderId,
        data: {
          companyEmailStatus: company.ok ? 'envoye' : 'echec',
          customerEmailStatus: customer ? (customer.ok ? 'envoye' : 'echec') : 'sansEmail',
          emailAttempts: company.attempts + (customer?.attempts ?? 0),
          emailError: [company.error, customer?.error].filter(Boolean).join('\n') || null,
        },
      })
    }
    if (!company.ok) payload.logger.error(`[e-mail] Échec d'envoi à l'entreprise (${service}) : ${company.error}`)
  } catch (error) {
    payload.logger.error({ err: error }, `[e-mail] Notification impossible pour ${service}`)
    if (input.orderId) {
      await payload
        .update({
          collection: 'orders',
          id: input.orderId,
          data: { companyEmailStatus: 'echec', emailError: error instanceof Error ? error.message : String(error) },
        })
        .catch(() => {})
    }
  }
}
