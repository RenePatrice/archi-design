/**
 * Numéros de commande : AD-AAAA-NNNN (ex. AD-2026-0001), remis à 1 chaque année.
 */
export function formatOrderNumber(year: number, sequence: number): string {
  return `AD-${year}-${String(sequence).padStart(4, '0')}`
}

/** Numéro qui suit le dernier numéro connu de l'année (null si aucune commande cette année). */
export function nextOrderNumber(year: number, lastNumber: string | null | undefined): string {
  const match = lastNumber?.match(/^AD-(\d{4})-(\d+)$/)
  const last = match && Number(match[1]) === year ? Number(match[2]) : 0
  return formatOrderNumber(year, last + 1)
}
