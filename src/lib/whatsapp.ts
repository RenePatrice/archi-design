/**
 * Liens WhatsApp « click to chat » (wa.me) : gratuits, sans API.
 * Le visiteur appuie lui-même sur « Envoyer » dans WhatsApp.
 */

/** Garde uniquement les chiffres : « +224 620 00 00 00 » devient « 224620000000 ». */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^00/, '')
}

/** Construit un lien wa.me avec un message pré-rempli. Renvoie null si le numéro est invalide. */
export function buildWhatsAppLink(number: string | null | undefined, message?: string): string | null {
  if (!number) return null
  const digits = normalizeWhatsAppNumber(number)
  if (digits.length < 8 || digits.length > 15) return null
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
