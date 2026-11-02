import { describe, expect, it } from 'vitest'

import { buildWhatsAppLink, normalizeWhatsAppNumber } from '@/lib/whatsapp'

describe('normalizeWhatsAppNumber', () => {
  it('garde uniquement les chiffres', () => {
    expect(normalizeWhatsAppNumber('+224 620 00 00 00')).toBe('224620000000')
  })

  it('retire le préfixe international 00', () => {
    expect(normalizeWhatsAppNumber('00224620000000')).toBe('224620000000')
  })
})

describe('buildWhatsAppLink', () => {
  it('construit un lien wa.me avec le message encodé', () => {
    expect(buildWhatsAppLink('+224 620 00 00 00', 'Bonjour, devis peinture ?')).toBe(
      'https://wa.me/224620000000?text=Bonjour%2C%20devis%20peinture%20%3F',
    )
  })

  it('accepte un lien sans message', () => {
    expect(buildWhatsAppLink('224620000000')).toBe('https://wa.me/224620000000')
  })

  it('refuse un numéro absent ou invalide', () => {
    expect(buildWhatsAppLink(null)).toBeNull()
    expect(buildWhatsAppLink('12345')).toBeNull()
  })
})
