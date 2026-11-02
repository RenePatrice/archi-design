import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RequestForm } from '@/components/forms/request-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { routing, type Locale } from '@/i18n/routing'
import { getPrivacySlug } from '@/lib/queries'
import { QUOTE_SERVICES, type QuoteService } from '@/lib/requests/services'
import { localizedPath, pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; service: string }> }

const isQuoteService = (value: string): value is QuoteService => (QUOTE_SERVICES as readonly string[]).includes(value)

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => QUOTE_SERVICES.filter((s) => s !== 'serigraphie').map((service) => ({ locale, service })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service } = await params
  if (!isQuoteService(service)) return {}
  const t = await getTranslations({ locale, namespace: 'Requests' })
  return pageMetadata({
    locale,
    path: `/devis/${service}`,
    title: t(`services.${service}.title`),
    description: t(`services.${service}.intro`),
  })
}

/** Formulaire de devis d'un service. */
export default async function ServiceQuotePage({ params }: Props) {
  const { locale, service } = await params
  if (!isQuoteService(service)) notFound()
  // L'impression a sa propre page, avec le calcul du prix en direct
  if (service === 'serigraphie') redirect(localizedPath(locale, '/impression'))
  setRequestLocale(locale)

  const [t, settings, privacySlug] = await Promise.all([getTranslations('Requests'), getSiteSettings(locale), getPrivacySlug(locale)])

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/devis' }, { label: t(`services.${service}.title`) }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t(`services.${service}.title`)} intro={t(`services.${service}.intro`)} />
      <section className="max-w-3xl">
        <RequestForm service={service} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
      </section>
    </div>
  )
}
