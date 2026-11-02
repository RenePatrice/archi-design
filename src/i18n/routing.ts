import { defineRouting } from 'next-intl/routing'

/**
 * Langues du site public.
 * Le français est servi sans préfixe (/), l'anglais sous /en.
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  // Pas de redirection automatique selon la langue du navigateur : « / » est toujours en français
  // (site francophone d'abord, recommandation de Google, et une redirection de moins sur mobile).
  // Le visiteur choisit l'anglais avec le bouton FR / EN.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
