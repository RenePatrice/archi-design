/**
 * Calcul du prix indicatif d'une impression. Fonction pure, utilisée à la fois dans le navigateur
 * (affichage en direct) et sur le serveur (prix enregistré avec la commande).
 */
export type PrintSupportPricing = {
  key: string
  pricing: 'unit' | 'area'
  price: number
  minQuantity?: number | null
  setupFee?: number | null
  discounts?: { fromQuantity: number; percent: number }[] | null
}

export type PrintEstimate =
  | { ok: true; total: number; unitPrice: number; areaM2: number | null; discountPercent: number; quantity: number }
  | { ok: false; reason: 'unknownSupport' | 'missingSize' | 'belowMinimum'; minQuantity?: number }

export function estimatePrint(
  support: PrintSupportPricing | undefined,
  input: { quantity: number; widthCm?: number | null; heightCm?: number | null },
): PrintEstimate {
  if (!support) return { ok: false, reason: 'unknownSupport' }
  const quantity = Math.floor(input.quantity)
  const min = support.minQuantity ?? 1
  if (!Number.isFinite(quantity) || quantity < min) return { ok: false, reason: 'belowMinimum', minQuantity: min }

  let areaM2: number | null = null
  let unitPrice = support.price
  if (support.pricing === 'area') {
    if (!input.widthCm || !input.heightCm || input.widthCm <= 0 || input.heightCm <= 0) return { ok: false, reason: 'missingSize' }
    areaM2 = (input.widthCm * input.heightCm) / 10_000
    unitPrice = support.price * areaM2
  }

  // Meilleure remise atteinte par la quantité commandée
  const discountPercent = (support.discounts ?? [])
    .filter((d) => quantity >= d.fromQuantity)
    .reduce((best, d) => Math.max(best, d.percent), 0)

  const total = unitPrice * quantity * (1 - discountPercent / 100) + (support.setupFee ?? 0)
  // Arrondi à la centaine de francs guinéens, comme sur un devis papier
  return {
    ok: true,
    total: Math.round(total / 100) * 100,
    unitPrice: Math.round(unitPrice),
    areaM2,
    discountPercent,
    quantity,
  }
}

/** Montant en francs guinéens, ex. « 1 250 000 GNF ». */
export function formatGNF(amount: number, locale = 'fr'): string {
  return `${new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 0 }).format(amount)} GNF`
}
