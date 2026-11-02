import 'server-only'

import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'
import type { Pole, Project } from '@/payload-types'

/*
 * Lectures du contenu pour le site public.
 * overrideAccess: false applique les règles d'un visiteur anonyme
 * (ex. seuls les projets publiés sont renvoyés).
 * cache() évite de refaire la même requête plusieurs fois dans un même rendu.
 */

const payload = () => getPayload({ config })

export const getPoles = cache(async (locale: Locale) => {
  const { docs } = await (await payload()).find({
    collection: 'poles',
    locale,
    sort: 'order',
    limit: 20,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getPoleBySlug = cache(async (locale: Locale, slug: string) => {
  const { docs } = await (await payload()).find({
    collection: 'poles',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getProjects = cache(
  async (locale: Locale, options: { featured?: boolean; poleId?: number; limit?: number } = {}) => {
    const where: Where = {}
    if (options.featured) where.featured = { equals: true }
    if (options.poleId) where.pole = { equals: options.poleId }
    const { docs } = await (await payload()).find({
      collection: 'projects',
      locale,
      where,
      sort: '-year',
      limit: options.limit ?? 200,
      depth: 1,
      overrideAccess: false,
    })
    return docs
  },
)

export const getProjectBySlug = cache(async (locale: Locale, slug: string) => {
  const { docs } = await (await payload()).find({
    collection: 'projects',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getTestimonials = cache(async (locale: Locale, limit = 6) => {
  const { docs } = await (await payload()).find({
    collection: 'testimonials',
    locale,
    sort: 'order',
    limit,
    depth: 0,
    overrideAccess: false,
  })
  return docs
})

export const getTeam = cache(async (locale: Locale) => {
  const { docs } = await (await payload()).find({
    collection: 'team-members',
    locale,
    sort: 'order',
    limit: 50,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getPartners = cache(async () => {
  const { docs } = await (await payload()).find({
    collection: 'partners',
    sort: 'order',
    limit: 30,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getPageBySlug = cache(async (locale: Locale, slug: string) => {
  const { docs } = await (await payload()).find({
    collection: 'pages',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getFooterPages = cache(async (locale: Locale) => {
  const { docs } = await (await payload()).find({
    collection: 'pages',
    locale,
    where: { showInFooter: { equals: true } },
    limit: 10,
    depth: 0,
    overrideAccess: false,
  })
  return docs
})

export const getKeyFigures = cache(async (locale: Locale) =>
  (await payload()).findGlobal({ slug: 'key-figures', locale, overrideAccess: false }),
)

export const getAboutPage = cache(async (locale: Locale) =>
  (await payload()).findGlobal({ slug: 'about-page', locale, overrideAccess: false }),
)

/** Le pôle d'un projet, que la relation soit chargée (objet) ou non (identifiant). */
export function projectPole(project: Project): Pole | null {
  return typeof project.pole === 'object' ? project.pole : null
}

/* ───────────── Phase 3 : boutique, formations, impression ───────────── */

export const getProducts = cache(async (locale: Locale) => {
  const { docs } = await (await payload()).find({
    collection: 'products',
    locale,
    sort: 'name',
    limit: 500,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getProductBySlug = cache(async (locale: Locale, slug: string) => {
  const { docs } = await (await payload()).find({
    collection: 'products',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

export const getTrainings = cache(async (locale: Locale) => {
  const { docs } = await (await payload()).find({
    collection: 'trainings',
    locale,
    sort: 'order',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getTrainingBySlug = cache(async (locale: Locale, slug: string) => {
  const { docs } = await (await payload()).find({
    collection: 'trainings',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return docs[0] ?? null
})

/** Sessions à venir (ou en cours), triées par date, avec leur formation. */
export const getUpcomingSessions = cache(async (locale: Locale, trainingId?: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { docs } = await (await payload()).find({
    collection: 'training-sessions',
    locale,
    where: {
      and: [
        { status: { not_equals: 'annulee' } },
        { or: [{ endDate: { greater_than_equal: today.toISOString() } }, { startDate: { greater_than_equal: today.toISOString() } }] },
        ...(trainingId ? [{ training: { equals: trainingId } }] : []),
      ],
    },
    sort: 'startDate',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })
  return docs
})

export const getPrintPricing = cache(async () => (await payload()).findGlobal({ slug: 'print-pricing', overrideAccess: false }))

/** Adresse de la politique de confidentialité, pour le lien des cases de consentement. */
export const getPrivacySlug = cache(async (locale: Locale) => {
  const pages = await getFooterPages(locale)
  return pages.find((p) => p.slug.includes('confidentialite'))?.slug ?? null
})
