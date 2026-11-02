import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ClientMessages } from '@/components/i18n/client-messages'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ThemeScript } from '@/components/layout/theme-script'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { CartProvider } from '@/components/shop/cart'
import { JsonLd } from '@/components/seo/json-ld'
import { routing } from '@/i18n/routing'
import { fontVariables } from '@/lib/fonts'
import { getFooterPages, getPoles } from '@/lib/queries'
import { siteUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

import './globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/** Pré-génère les deux versions linguistiques. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requested } = await params
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: 'ARCHI-DESIGN Guinée',
    alternates: {
      canonical: locale === routing.defaultLocale ? '/' : `/${locale}`,
      languages: { fr: '/', en: '/en', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      siteName: 'ARCHI-DESIGN Guinée',
      locale: locale === 'fr' ? 'fr_GN' : 'en_US',
      title: t('title'),
      description: t('description'),
    },
    icons: { apple: '/icons/apple-touch-icon.png' },
    appleWebApp: { capable: true, title: 'ARCHI-DESIGN', statusBarStyle: 'default' },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1F4A3A' },
    { media: '(prefers-color-scheme: dark)', color: '#151716' },
  ],
}

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Active le rendu statique des pages pour cette langue
  setRequestLocale(locale)

  const [settings, t, poles, footerPages] = await Promise.all([
    getSiteSettings(locale),
    getTranslations('Common'),
    getPoles(locale),
    getFooterPages(locale),
  ])

  // Fiche entreprise pour Google (recherche locale « architecte Conakry »…)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#entreprise`,
    name: settings.companyName,
    slogan: settings.tagline,
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512.png`,
    image: `${siteUrl}/icons/icon-512.png`,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'GN' },
    ...(settings.latitude != null && settings.longitude != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: settings.latitude, longitude: settings.longitude } }
      : {}),
    areaServed: ['Guinée', 'Afrique de l’Ouest'],
    sameAs: settings.socials?.map((s) => s.url) ?? [],
    knowsAbout: poles.map((p) => p.title),
  }

  return (
    // data-theme est posé par ThemeScript avant l'hydratation : on tolère cet écart
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        {/* Seulement les textes de l'en-tête, du panier et de WhatsApp ; chaque rubrique ajoute les siens */}
        <ClientMessages namespaces={['Nav', 'Theme', 'Language', 'WhatsApp', 'Shop']}>
          <CartProvider>
          <a
            href="#contenu"
            className="sr-only z-[60] bg-accent px-4 py-3 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            {t('skipToContent')}
          </a>
          <SiteHeader />
          <main id="contenu" className="flex-1">
            {children}
          </main>
          <SiteFooter settings={settings} poles={poles} pages={footerPages} />
          <JsonLd data={organization} />
          <WhatsAppButton number={settings.whatsappNumber ?? null} />
          <ServiceWorkerRegister />
          </CartProvider>
        </ClientMessages>
      </body>
    </html>
  )
}
