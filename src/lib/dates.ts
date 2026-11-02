/** Dates de session lisibles, ex. « 12 janvier 2027 », à l'heure de Conakry. */
export function formatSessionDates(locale: string, start: string, end?: string | null) {
  const fmt = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Conakry',
  })
  return { start: fmt.format(new Date(start)), end: end ? fmt.format(new Date(end)) : null }
}
