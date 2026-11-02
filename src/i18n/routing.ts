import { defineRouting } from 'next-intl/routing'

/**
 * Langues du site public.
 * Le français est servi sans préfixe (/), l'anglais sous /en.
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
