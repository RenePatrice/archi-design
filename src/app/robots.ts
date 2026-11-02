import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/seo'

/** robots.txt : tout le site est indexable sauf le back-office, l'API et les pages internes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/pdf', '/design-system', '/en/design-system', '/boutique/panier', '/en/boutique/panier', '/espace-client', '/en/espace-client'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
