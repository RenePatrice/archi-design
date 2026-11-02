import 'server-only'

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { getPayload, type Payload } from 'payload'

import { routing, type Locale } from '@/i18n/routing'
import type { OrderFile } from '@/payload-types'
import { notifyRequest } from '@/lib/email/notify'
import { isRateLimited } from '@/lib/rate-limit'
import { simulate } from '@/lib/simulator/estimate'
import { buildPreQuotePdf, loadSimulatorPricing } from '@/lib/simulator/prequote'

import { nextOrderNumber } from './numbering'
import { estimatePrint, formatGNF } from './print-pricing'
import { buildRequestSchema, formDataToObject, validateFiles, type RequestErrorKey } from './schema'
import { isRequestService, MAX_FILE_SIZE, SERVICES, type FieldDef, type RequestService } from './services'

export type RequestState =
  | { status: 'idle' }
  | { status: 'success'; number: string; whatsappText: string; emailSent: boolean }
  | { status: 'error'; reason: 'invalid' | 'rateLimit' | 'server'; fieldErrors: Record<string, RequestErrorKey> }

type Translator = (key: string, values?: Record<string, string | number>) => string
type Row = { label: string; value: string }

/** Options partagées entre plusieurs champs (ex. « kind » pour la calligraphie et le dessin). */
const optionKey = (field: string) => field

function formatValue(field: FieldDef, raw: unknown, t: Translator, locale: Locale): string | null {
  if (raw === undefined || raw === null || raw === '' || (Array.isArray(raw) && raw.length === 0)) return null
  switch (field.type) {
    case 'select':
      return t(`options.${optionKey(field.name)}.${raw}`)
    case 'checkboxes':
      return (raw as string[]).map((v) => t(`options.${optionKey(field.name)}.${v}`)).join(', ')
    case 'checkbox':
      return raw ? (locale === 'fr' ? 'Oui' : 'Yes') : null
    case 'number':
      return `${new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB').format(Number(raw))}${field.unit ? ` ${field.unit}` : ''}`
    case 'date':
      return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(String(raw)))
    case 'files':
      return null
    default:
      return String(raw)
  }
}

/** Crée la commande avec le numéro suivant ; réessaie si deux demandes arrivent au même instant. */
async function createWithNumber(payload: Payload, data: Record<string, unknown>) {
  const year = new Date().getFullYear()
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await payload.find({
      collection: 'orders',
      where: { number: { like: `AD-${year}-` } },
      sort: '-number',
      limit: 1,
      depth: 0,
    })
    const number = nextOrderNumber(year, last.docs[0]?.number)
    try {
      return await payload.create({ collection: 'orders', data: { ...data, number } as never })
    } catch (error) {
      // Numéro déjà pris par une demande simultanée : on recalcule
      if (!String(error).toLowerCase().includes('unique') && !String(error).includes('number')) throw error
    }
  }
  throw new Error('Impossible d’attribuer un numéro de commande')
}

/**
 * Traite une demande envoyée depuis un formulaire du site.
 * Ordre : piège à robots → limitation → validation → fichiers → enregistrement → e-mails (après la réponse).
 */
export async function processRequest(formData: FormData): Promise<RequestState> {
  const fail = (reason: 'invalid' | 'rateLimit' | 'server', fieldErrors: Record<string, RequestErrorKey> = {}): RequestState => ({
    status: 'error',
    reason,
    fieldErrors,
  })

  const service = formData.get('service')
  if (!isRequestService(service) || service === 'contact') return fail('invalid')
  const locale: Locale = routing.locales.find((l) => l === formData.get('locale')) ?? routing.defaultLocale

  // 1. Piège à robots : réponse « réussie » sans rien enregistrer
  if (formData.get('website')) return { status: 'success', number: '', whatsappText: '', emailSent: false }

  // 2. Limitation de débit par adresse IP
  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'inconnue'
  if (isRateLimited(`request:${ip}`, 8)) return fail('rateLimit')

  // 3. Validation des champs
  const def = SERVICES[service]
  const parsed = buildRequestSchema(def).safeParse(formDataToObject(formData, def))
  const fieldErrors: Record<string, RequestErrorKey> = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message as RequestErrorKey
  }

  // 4. Fichiers joints
  const fileField = def.fields.find((f): f is Extract<FieldDef, { type: 'files' }> => f.type === 'files')
  const uploads = fileField ? formData.getAll(fileField.name).filter((v): v is File => v instanceof File && v.size > 0) : []
  if (fileField) {
    const fileError = validateFiles(uploads, fileField, MAX_FILE_SIZE)
    if (fileError) fieldErrors[fileField.name] = fileError
  }

  const payload = await getPayload({ config })

  // 5. Données propres à la boutique et aux formations, relues en base (jamais de prix venant du navigateur)
  let lines: { product: number; reference: string; name: string; quantity: number; unitPrice: number; subtotal: number }[] = []
  let sessionDoc: { id: number; label?: string | null } | null = null
  if (service === 'boutique') {
    try {
      const cart = JSON.parse(String(formData.get('cart') ?? '[]')) as { id: number; quantity: number }[]
      const ids = cart.map((item) => Number(item.id)).filter(Number.isInteger)
      const { docs } = ids.length
        ? await payload.find({ collection: 'products', where: { id: { in: ids } }, locale, limit: 100, depth: 0, overrideAccess: false })
        : { docs: [] }
      lines = cart
        .map((item) => {
          const product = docs.find((d) => d.id === Number(item.id))
          const quantity = Math.min(Math.max(Math.floor(Number(item.quantity)), 1), 10_000)
          return product
            ? { product: product.id, reference: product.reference, name: product.name, quantity, unitPrice: product.price, subtotal: product.price * quantity }
            : null
        })
        .filter((l): l is NonNullable<typeof l> => l !== null)
      if (lines.length === 0 || lines.length !== cart.length) fieldErrors.cart = 'cart'
    } catch {
      fieldErrors.cart = 'cart'
    }
  }
  if (service === 'formation') {
    const sessionId = Number(formData.get('session'))
    const session = Number.isInteger(sessionId)
      ? await payload.findByID({ collection: 'training-sessions', id: sessionId, depth: 0, locale: 'fr', disableErrors: true })
      : null
    if (!session || session.status !== 'ouverte') fieldErrors.session = 'session'
    else sessionDoc = session
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) return fail('invalid', fieldErrors)
  const data = parsed.data as Record<string, unknown> & typeof parsed.data

  try {
    // 6. Prix indicatif de l'impression, recalculé côté serveur
    let estimatedTotal: number | undefined
    if (service === 'serigraphie') {
      const pricing = await payload.findGlobal({ slug: 'print-pricing', depth: 0 })
      const support = pricing.supports?.find((s) => s.key === data.support)
      const estimate = estimatePrint(
        support ? { ...support, discounts: support.discounts?.map((d) => ({ fromQuantity: d.fromQuantity, percent: d.percent })) } : undefined,
        { quantity: Number(data.quantity), widthCm: data.width as number | undefined, heightCm: data.height as number | undefined },
      )
      if (estimate.ok) estimatedTotal = estimate.total
    }
    if (service === 'boutique') estimatedTotal = lines.reduce((sum, l) => sum + l.subtotal, 0)

    // Simulateur : fourchette recalculée avec la grille en base
    const simInput =
      service === 'simulateur'
        ? { type: String(data.simType), surface: Number(data.simSurface), finish: String(data.simFinish), zone: String(data.simZone) }
        : null
    const simulation = simInput ? simulate(await loadSimulatorPricing(), simInput) : null
    if (simulation && !simulation.ok) return fail('invalid', { simSurface: 'number' })

    // 7. Fichiers dans le stockage privé. Payload vérifie leur contenu réel :
    //    un fichier corrompu ou déguisé est refusé avec un message sur le champ concerné.
    const files: OrderFile[] = []
    for (const file of uploads) {
      try {
        files.push(
          await payload.create({
            collection: 'order-files',
            data: {},
            file: { data: Buffer.from(await file.arrayBuffer()), mimetype: file.type, name: file.name, size: file.size },
          }),
        )
      } catch (error) {
        payload.logger.warn(`[demande] Fichier refusé (${file.name}) : ${error instanceof Error ? error.message : error}`)
        await Promise.all(files.map((f) => payload.delete({ collection: 'order-files', id: f.id }).catch(() => {})))
        return fail('invalid', { [fileField?.name ?? 'files']: 'fileType' })
      }
    }

    // 8. Récapitulatifs lisibles : en français pour l'équipe, dans la langue du client pour l'accusé
    const buildRows = async (lang: Locale) => {
      const t = (await getTranslations({ locale: lang, namespace: 'Requests' })) as unknown as Translator
      const rows: Row[] = []
      if (sessionDoc?.label) rows.push({ label: t('fields.session'), value: sessionDoc.label })
      for (const field of def.fields) {
        const value = formatValue(field, data[field.name], t, lang)
        if (value) rows.push({ label: t(`fields.${field.name}`), value })
      }
      if (simulation?.ok) {
        const sim = (await getTranslations({ locale: lang, namespace: 'Simulator' })) as unknown as Translator
        rows.push({ label: sim('budget'), value: `${formatGNF(simulation.costMin, lang)} – ${formatGNF(simulation.costMax, lang)}` })
        rows.push({ label: sim('duration'), value: sim('months', { min: simulation.monthsMin, max: simulation.monthsMax }) })
      }
      if (service === 'serigraphie' && estimatedTotal !== undefined)
        rows.push({ label: lang === 'fr' ? 'Prix indicatif' : 'Indicative price', value: formatGNF(estimatedTotal, lang) })
      if (files.length) rows.push({ label: t('fields.files'), value: files.map((f) => f.filename).join('\n') })
      const common: [string, unknown][] = [
        ['common.name', data.name],
        ['common.phone', data.phone],
        ['common.email', data.email],
        ['common.city', data.city],
        ['common.address', data.address],
        ['common.preferredContact', data.preferredContact && t(`options.preferredContact.${data.preferredContact}`)],
        ['common.receptionMode', data.receptionMode && t(`options.receptionMode.${data.receptionMode}`)],
        ['common.paymentMode', data.paymentMode && t(`options.paymentMode.${data.paymentMode}`)],
        ['common.message', data.message],
      ]
      for (const [key, value] of common) if (value) rows.push({ label: t(key), value: String(value) })
      return { rows, t }
    }
    const [fr, own] = await Promise.all([buildRows('fr'), buildRows(locale)])

    // 9. Enregistrement de la commande, avec son numéro
    const poleKey = def.pole
    const pole = poleKey
      ? (await payload.find({ collection: 'poles', where: { key: { equals: poleKey } }, limit: 1, depth: 0 })).docs[0]
      : undefined
    const order = await createWithNumber(payload, {
      service,
      status: 'nouvelle',
      pole: pole?.id,
      customerName: data.name,
      customerPhone: data.phone,
      customerEmail: data.email || undefined,
      customerCity: data.city,
      customerAddress: data.address || undefined,
      preferredContact: fr.t(`options.preferredContact.${data.preferredContact}`),
      receptionMode: data.receptionMode ? fr.t(`options.receptionMode.${data.receptionMode}`) : undefined,
      paymentMode: data.paymentMode ? fr.t(`options.paymentMode.${data.paymentMode}`) : undefined,
      message: data.message || undefined,
      consent: true,
      locale,
      details: fr.rows,
      lines,
      estimatedTotal,
      session: sessionDoc?.id,
      files: files.map((f) => f.id),
      companyEmailStatus: 'attente',
      customerEmailStatus: data.email ? 'attente' : 'sansEmail',
    })

    // 10. E-mails envoyés après la réponse au visiteur (la page de confirmation s'affiche tout de suite)
    const date = (lang: Locale) =>
      new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Conakry' }).format(new Date())
    const emailLines = lines.map((l) => ({
      reference: l.reference,
      name: l.name,
      quantity: l.quantity,
      unitPrice: formatGNF(l.unitPrice),
      subtotal: formatGNF(l.subtotal),
    }))
    const serviceTitle = (t: Translator) => t(`services.${service}.title`)
    const typeField = def.subjectField ? def.fields.find((f) => f.name === def.subjectField) : undefined
    const typeLabel = typeField ? (formatValue(typeField, data[typeField.name], fr.t, 'fr') ?? undefined) : undefined

    after(() =>
      notifyRequest({
        payload,
        service,
        locale,
        orderId: order.id,
        customerEmail: data.email ? String(data.email) : null,
        typeLabel: typeLabel?.toLowerCase(),
        trainingLabel: sessionDoc?.label ?? undefined,
        files: files.map((f) => ({ filename: f.filename!, filesize: f.filesize, mimeType: f.mimeType })),
        // Le PDF de pré-devis porte le numéro de la demande et le nom du client
        generatedAttachments: simInput
          ? async () => {
              const built = await buildPreQuotePdf(simInput, locale, { reference: order.number, customerName: String(data.name) })
              return built ? [{ filename: `pre-devis-${order.number}.pdf`, content: built.pdf, contentType: 'application/pdf' }] : []
            }
          : undefined,
        companyData: {
          number: order.number,
          serviceLabel: serviceTitle(fr.t),
          date: date('fr'),
          customerName: String(data.name),
          customerPhone: String(data.phone),
          rows: fr.rows,
          lines: emailLines,
          total: estimatedTotal !== undefined ? formatGNF(estimatedTotal) : undefined,
        },
        customerData: {
          number: order.number,
          serviceLabel: serviceTitle(own.t),
          date: date(locale),
          customerName: String(data.name),
          customerPhone: String(data.phone),
          rows: own.rows,
          lines: emailLines,
          total: estimatedTotal !== undefined ? formatGNF(estimatedTotal, locale) : undefined,
        },
        ackLabels:
          locale === 'fr'
            ? { number: 'Numéro de votre demande :', summary: 'Récapitulatif', whatsapp: 'Nous écrire sur WhatsApp', product: 'Produit', qty: 'Qté', unitPrice: 'Prix unit.', subtotal: 'Sous-total', total: 'Total indicatif' }
            : { number: 'Your request number:', summary: 'Summary', whatsapp: 'Message us on WhatsApp', product: 'Product', qty: 'Qty', unitPrice: 'Unit price', subtotal: 'Subtotal', total: 'Indicative total' },
      }),
    )

    // Texte pré-rempli pour le bouton « Envoyer aussi sur WhatsApp »
    const whatsappText = [
      own.t('whatsappIntro', { number: order.number }),
      serviceTitle(own.t),
      ...lines.map((l) => `• ${l.quantity} × ${l.name} (${l.reference})`),
      ...own.rows.map((r) => `${r.label} : ${r.value}`),
      estimatedTotal !== undefined && service === 'boutique' ? `Total : ${formatGNF(estimatedTotal, locale)}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    return { status: 'success', number: order.number, whatsappText, emailSent: Boolean(data.email) }
  } catch (error) {
    payload.logger.error({ err: error }, `[demande] Enregistrement impossible (${service})`)
    return fail('server')
  }
}

export type { RequestService }
