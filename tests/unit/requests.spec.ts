import { describe, expect, it } from 'vitest'

import { fillPlaceholders } from '@/lib/email/placeholders'
import { formatOrderNumber, nextOrderNumber } from '@/lib/requests/numbering'
import { estimatePrint, formatGNF } from '@/lib/requests/print-pricing'
import { buildRequestSchema, formDataToObject, validateFiles } from '@/lib/requests/schema'
import { SERVICES } from '@/lib/requests/services'

describe('numérotation des commandes', () => {
  it('formate AD-AAAA-NNNN', () => {
    expect(formatOrderNumber(2026, 1)).toBe('AD-2026-0001')
    expect(formatOrderNumber(2026, 12345)).toBe('AD-2026-12345')
  })

  it('repart à 1 chaque année et suit le dernier numéro', () => {
    expect(nextOrderNumber(2026, null)).toBe('AD-2026-0001')
    expect(nextOrderNumber(2026, 'AD-2026-0041')).toBe('AD-2026-0042')
    expect(nextOrderNumber(2027, 'AD-2026-0999')).toBe('AD-2027-0001')
  })
})

describe('prix indicatif d’impression', () => {
  const textile = { key: 'textile', pricing: 'unit' as const, price: 60_000, minQuantity: 10, setupFee: 150_000, discounts: [{ fromQuantity: 50, percent: 10 }, { fromQuantity: 200, percent: 20 }] }
  const bache = { key: 'bache', pricing: 'area' as const, price: 150_000, minQuantity: 1, setupFee: 0, discounts: [] }

  it('calcule un prix à la pièce avec frais fixes', () => {
    const r = estimatePrint(textile, { quantity: 20 })
    expect(r).toMatchObject({ ok: true, total: 1_350_000, discountPercent: 0 })
  })

  it('applique la meilleure remise atteinte', () => {
    const r = estimatePrint(textile, { quantity: 250 })
    expect(r).toMatchObject({ ok: true, discountPercent: 20, total: 250 * 60_000 * 0.8 + 150_000 })
  })

  it('calcule au m² à partir des centimètres', () => {
    const r = estimatePrint(bache, { quantity: 2, widthCm: 300, heightCm: 100 })
    expect(r).toMatchObject({ ok: true, areaM2: 3, total: 900_000 })
  })

  it('signale les cas impossibles', () => {
    expect(estimatePrint(textile, { quantity: 5 })).toEqual({ ok: false, reason: 'belowMinimum', minQuantity: 10 })
    expect(estimatePrint(bache, { quantity: 1 })).toEqual({ ok: false, reason: 'missingSize' })
    expect(estimatePrint(undefined, { quantity: 1 })).toEqual({ ok: false, reason: 'unknownSupport' })
  })

  it('affiche les montants en francs guinéens', () => {
    expect(formatGNF(1_250_000).replace(/\s/g, ' ')).toBe('1 250 000 GNF')
  })
})

describe('validation des demandes', () => {
  const valid = { name: 'Aïssatou Camara', phone: '+224 620 00 00 00', city: 'Conakry', consent: 'on' }

  it('accepte une demande de peinture complète', () => {
    const r = buildRequestSchema(SERVICES.peinture).safeParse({ ...valid, surfaceType: 'exterieur', area: '180' })
    expect(r.success).toBe(true)
    expect(r.data).toMatchObject({ area: 180, surfaceType: 'exterieur' })
  })

  it('renvoie une clé d’erreur par champ', () => {
    const r = buildRequestSchema(SERVICES.peinture).safeParse({ ...valid, phone: '123', area: '', consent: undefined })
    expect(r.success).toBe(false)
    const errors = Object.fromEntries(r.error!.issues.map((i) => [i.path[0], i.message]))
    expect(errors).toMatchObject({ phone: 'phone', consent: 'consent', surfaceType: 'choice' })
  })

  it('garde toutes les cases cochées d’un même champ', () => {
    const fd = new FormData()
    fd.append('deliverables', 'plans')
    fd.append('deliverables', 'suivi')
    expect(formDataToObject(fd, SERVICES.architecture).deliverables).toEqual(['plans', 'suivi'])
  })

  it('refuse les fichiers trop lourds ou d’un type non prévu', () => {
    const field = SERVICES.architecture.fields.find((f) => f.type === 'files')!
    if (field.type !== 'files') throw new Error()
    const pdf = new File(['x'], 'plan.pdf', { type: 'application/pdf' })
    const exe = new File(['x'], 'virus.exe', { type: 'application/x-msdownload' })
    expect(validateFiles([pdf], field, 10)).toBeNull()
    expect(validateFiles([exe], field, 10)).toBe('fileType')
    expect(validateFiles([new File(['x'.repeat(20)], 'gros.pdf', { type: 'application/pdf' })], field, 10)).toBe('fileSize')
  })
})

describe('modèles d’e-mail', () => {
  it('remplace les variables et retire un tiret final orphelin', () => {
    expect(fillPlaceholders('[ARCHI-DESIGN] Demande de projet – {type}', { type: 'villa' })).toBe('[ARCHI-DESIGN] Demande de projet – villa')
    expect(fillPlaceholders('[ARCHI-DESIGN] Demande de projet – {type}', {})).toBe('[ARCHI-DESIGN] Demande de projet')
    expect(fillPlaceholders('Commande n° {numero}', { numero: 'AD-2026-0007' })).toBe('Commande n° AD-2026-0007')
  })
})
