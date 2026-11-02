/**
 * Menu principal du site. Les clés renvoient aux textes de messages/*.json (section « Nav »).
 */
export const mainNav = [
  { key: 'services', href: '/services' },
  { key: 'projects', href: '/realisations' },
  { key: 'training', href: '/formations' },
  { key: 'shop', href: '/boutique' },
  { key: 'about', href: '/a-propos' },
  { key: 'contact', href: '/contact' },
] as const

/** Les 8 pôles, dans l'ordre de la chaîne de valeur. Clés de la section « Poles ». */
export const poles = [
  'architecture',
  'peinture',
  'calligraphie',
  'serigraphie',
  'dessin',
  'formation',
  'commerce',
  'prestation',
] as const

export type PoleKey = (typeof poles)[number]

/**
 * Étapes de la chaîne de valeur (section « Chain.steps ») et pôle qui réalise chacune.
 * Ordre tiré du cahier des charges : Architecture → … → Sérigraphie.
 */
export const valueChain = [
  { step: 'architecture', pole: 'architecture' },
  { step: 'interieur', pole: 'architecture' },
  { step: 'peinture', pole: 'peinture' },
  { step: 'signaletique', pole: 'serigraphie' },
  { step: 'decoration', pole: 'calligraphie' },
  { step: 'mobilier', pole: 'architecture' },
  { step: 'communication', pole: 'serigraphie' },
  { step: 'serigraphie', pole: 'serigraphie' },
] as const satisfies readonly { step: string; pole: PoleKey }[]

/** Page où demander un devis pour un pôle donné. */
export function quoteHref(pole: string | null | undefined): string {
  switch (pole) {
    case 'serigraphie':
      return '/impression'
    case 'formation':
      return '/formations'
    case 'commerce':
      return '/boutique'
    case 'architecture':
    case 'peinture':
    case 'calligraphie':
    case 'dessin':
    case 'prestation':
      return `/devis/${pole}`
    default:
      return '/devis'
  }
}
