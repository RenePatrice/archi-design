import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RequestForm } from '@/components/forms/request-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import type { Locale } from '@/i18n/routing'
import { getPrintPricing, getPrivacySlug } from '@/lib/queries'
import type { PrintSupportPricing } from '@/lib/requests/print-pricing'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Print' })
  return pageMetadata({ locale, path: '/impression', title: t('metaTitle'), description: t('metaDescription') })
}

/** Commande d'impression en ligne : support, dimensions, quantité, fichier, prix indicatif en direct. */
export default async function PrintPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, settings, privacySlug, pricing] = await Promise.all([
    getTranslations('Print'),
    getSiteSettings(locale),
    getPrivacySlug(locale),
    getPrintPricing(),
  ])

  const supports: PrintSupportPricing[] = (pricing.supports ?? []).map((s) => ({
    key: s.key,
    pricing: s.pricing,
    price: s.price,
    minQuantity: s.minQuantity,
    setupFee: s.setupFee,
    discounts: s.discounts?.map((d) => ({ fromQuantity: d.fromQuantity, percent: d.percent })) ?? [],
  }))

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <section className="max-w-3xl">
        <RequestForm service="serigraphie" whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} printSupports={supports} />
      </section>
    </div>
  )
}
