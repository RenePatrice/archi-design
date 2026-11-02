import type { Metadata } from 'next'

import { routing, type Locale } from '@/i18n/routing'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** Chemin public d'une page dans une langue : le français sans préfixe, l'anglais sous /en. */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path
  return locale === routing.defaultLocale ? clean || '/' : `/${locale}${clean}`
}

export function absoluteUrl(locale: Locale, path: string): string {
  return `${siteUrl}${localizedPath(locale, path)}`
}

type PageMetaInput = {
  locale: Locale
  /** Chemin sans préfixe de langue, ex. « /realisations/villa-kipe » */
  path: string
  title?: string
  description?: string
  /** URL d'image (relative ou absolue) pour les aperçus de partage */
  image?: string | null
  noIndex?: boolean
}

/**
 * Métadonnées d'une page : titre, description, adresse canonique,
 * versions FR/EN (hreflang) et aperçu de partage (Open Graph).
 */
export function pageMetadata({ locale, path, title, description, image, noIndex }: PageMetaInput): Metadata {
  // Une clé présente mais vide écraserait le titre par défaut du layout : on ne la met que si elle existe
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: localizedPath(locale, path),
      languages: {
        fr: localizedPath('fr', path),
        en: localizedPath('en', path),
        'x-default': localizedPath('fr', path),
      },
    },
    openGraph: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      url: localizedPath(locale, path),
      ...(image ? { images: [{ url: image }] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  }
}
