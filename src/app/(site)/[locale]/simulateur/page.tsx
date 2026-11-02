import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { Simulator } from '@/components/simulator/simulator'
import type { Locale } from '@/i18n/routing'
import { getPrivacySlug } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { loadSimulatorPricing } from '@/lib/simulator/prequote'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Simulator' })
  return pageMetadata({ locale, path: '/simulateur', title: t('metaTitle'), description: t('metaDescription') })
}

/** Simulateur de projet et de devis, avec PDF de pré-devis. */
export default async function SimulatorPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, pricing, settings, privacySlug] = await Promise.all([
    getTranslations('Simulator'),
    loadSimulatorPricing(),
    getSiteSettings(locale),
    getPrivacySlug(locale),
  ])

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <Simulator pricing={pricing} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
    </div>
  )
}
