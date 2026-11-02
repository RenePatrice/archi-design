/**
 * Simulateur de projet : fourchette de coût et de délai à partir du type, de la surface,
 * du niveau de finition et de la zone. Fonction pure, partagée par le navigateur (affichage
 * en direct), le serveur (demande enregistrée) et le PDF de pré-devis.
 */

export const SIM_PROJECT_TYPES = ['villa', 'immeuble', 'commerce', 'bureaux', 'renovation', 'interieur'] as const
export const SIM_FINISHES = ['economique', 'standard', 'hautDeGamme'] as const
export const SIM_ZONES = ['conakry', 'interieur', 'sousRegion'] as const

export type SimProjectType = (typeof SIM_PROJECT_TYPES)[number]
export type SimFinish = (typeof SIM_FINISHES)[number]
export type SimZone = (typeof SIM_ZONES)[number]

export type SimulatorPricing = {
  types: {
    key: string
    /** Prix au m² en GNF, fourchette basse et haute, par niveau de finition */
    economiqueMin: number
    economiqueMax: number
    standardMin: number
    standardMax: number
    hautDeGammeMin: number
    hautDeGammeMax: number
    /** Délai fixe (études, permis) + délai proportionnel à la surface */
    baseMonths: number
    monthsPer100m2: number
    minSurface?: number | null
    maxSurface?: number | null
  }[]
  zones: { key: string; coefficient: number; extraMonths?: number | null }[]
}

export type SimulatorInput = { type: string; surface: number; finish: string; zone: string }

export type SimulatorResult =
  | {
      ok: true
      costMin: number
      costMax: number
      pricePerM2Min: number
      pricePerM2Max: number
      monthsMin: number
      monthsMax: number
    }
  | { ok: false; reason: 'unknownType' | 'unknownZone' | 'surface'; minSurface?: number; maxSurface?: number }

/** Arrondi « commercial » : au million de GNF au-dessus de 10 millions, sinon à la centaine de milliers. */
export function roundGNF(amount: number): number {
  const step = amount >= 10_000_000 ? 1_000_000 : 100_000
  return Math.round(amount / step) * step
}

export function simulate(pricing: SimulatorPricing, input: SimulatorInput): SimulatorResult {
  const type = pricing.types.find((t) => t.key === input.type)
  if (!type) return { ok: false, reason: 'unknownType' }
  const zone = pricing.zones.find((z) => z.key === input.zone)
  if (!zone) return { ok: false, reason: 'unknownZone' }

  const minSurface = type.minSurface ?? 10
  const maxSurface = type.maxSurface ?? 20_000
  const surface = Number(input.surface)
  if (!Number.isFinite(surface) || surface < minSurface || surface > maxSurface) {
    return { ok: false, reason: 'surface', minSurface, maxSurface }
  }

  const finish = (SIM_FINISHES as readonly string[]).includes(input.finish) ? (input.finish as SimFinish) : 'standard'
  const pricePerM2Min = type[`${finish}Min`] * zone.coefficient
  const pricePerM2Max = type[`${finish}Max`] * zone.coefficient

  // Délai : la fourchette haute ajoute 30 % (saison des pluies, approvisionnement)
  const months = type.baseMonths + (type.monthsPer100m2 * surface) / 100 + (zone.extraMonths ?? 0)
  const monthsMin = Math.max(1, Math.round(months))
  const monthsMax = Math.max(monthsMin + 1, Math.round(months * 1.3))

  return {
    ok: true,
    costMin: roundGNF(pricePerM2Min * surface),
    costMax: roundGNF(pricePerM2Max * surface),
    pricePerM2Min: roundGNF(pricePerM2Min),
    pricePerM2Max: roundGNF(pricePerM2Max),
    monthsMin,
    monthsMax,
  }
}
