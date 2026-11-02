import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'

export type SiteSettingsData = Pick<
  SiteSetting,
  | 'companyName'
  | 'tagline'
  | 'whatsappNumber'
  | 'phone'
  | 'email'
  | 'address'
  | 'openingHours'
  | 'socials'
  | 'latitude'
  | 'longitude'
  | 'rccm'
  | 'nif'
>

/** Valeurs utilisées tant que les réglages n'ont pas été saisis dans le back-office. */
const fallback: SiteSettingsData = {
  companyName: 'ARCHI-DESIGN Guinée SARL',
  tagline: 'Construire mieux avec les ressources et les réalités de notre territoire.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null,
  phone: null,
  email: null,
  address: 'Conakry, Guinée',
  openingHours: null,
  socials: [],
  latitude: null,
  longitude: null,
  rccm: null,
  nif: null,
}

/**
 * Lit les réglages du site (mis en cache, invalidé par la balise « site-settings »).
 * Si la base est injoignable (ex. pendant un build sans base), le site reste affichable
 * avec les valeurs par défaut.
 */
export const getSiteSettings = (locale: Locale) =>
  unstable_cache(
    async (): Promise<SiteSettingsData> => {
      try {
        const payload = await getPayload({ config })
        const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 0 })
        return {
          ...fallback,
          ...Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== null && v !== undefined)),
        } as SiteSettingsData
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        console.warn(`[site-settings] Réglages indisponibles, valeurs par défaut utilisées (${reason}).`)
        return fallback
      }
    },
    ['site-settings', locale],
    { tags: ['site-settings'], revalidate: 3600 },
  )()
