import config from '@payload-config'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import { routing } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'

// Régénéré au plus toutes les heures
export const revalidate = 3600

/** Plan du site XML (/sitemap.xml) avec les versions française et anglaise de chaque page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const query = { limit: 1000, depth: 0, overrideAccess: false, select: { slug: true, updatedAt: true } } as const

  const [poles, projects, pages, products, trainings] = await Promise.all([
    payload.find({ collection: 'poles', ...query }),
    payload.find({ collection: 'projects', ...query }),
    payload.find({ collection: 'pages', ...query }),
    payload.find({ collection: 'products', ...query }),
    payload.find({ collection: 'trainings', ...query }),
  ])

  const entries: { path: string; lastModified?: string; priority: number }[] = [
    { path: '/', priority: 1 },
    { path: '/services', priority: 0.9 },
    { path: '/realisations', priority: 0.9 },
    { path: '/a-propos', priority: 0.6 },
    { path: '/contact', priority: 0.8 },
    { path: '/devis', priority: 0.9 },
    ...['architecture', 'peinture', 'calligraphie', 'dessin', 'prestation'].map((s) => ({ path: `/devis/${s}`, priority: 0.7 })),
    { path: '/impression', priority: 0.8 },
    { path: '/boutique', priority: 0.8 },
    { path: '/formations', priority: 0.8 },
    ...products.docs.map((d) => ({ path: `/boutique/${d.slug}`, lastModified: d.updatedAt, priority: 0.6 })),
    ...trainings.docs.map((d) => ({ path: `/formations/${d.slug}`, lastModified: d.updatedAt, priority: 0.7 })),
    ...poles.docs.map((d) => ({ path: `/services/${d.slug}`, lastModified: d.updatedAt, priority: 0.8 })),
    ...projects.docs.map((d) => ({ path: `/realisations/${d.slug}`, lastModified: d.updatedAt, priority: 0.7 })),
    ...pages.docs.map((d) => ({ path: `/${d.slug}`, lastModified: d.updatedAt, priority: 0.2 })),
  ]

  return entries.flatMap(({ path, lastModified, priority }) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      priority: locale === routing.defaultLocale ? priority : priority * 0.9,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)])),
      },
    })),
  )
}
