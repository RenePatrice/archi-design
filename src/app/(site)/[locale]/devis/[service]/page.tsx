import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LineIcon } from '@/components/ui/ornaments'
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

/** Déroulé d'une demande, à côté du formulaire : rassure avant d'écrire. */
async function RequestProcess() {
  const t = await getTranslations('Requests.process')
  const steps = t.raw('steps') as string[]
  return (
    <aside className="flex flex-col gap-8 self-start border border-line bg-surface p-8 lg:sticky lg:top-28">
      <h2 className="font-display text-3xl">{t('title')}</h2>
      <ol className="relative flex flex-col gap-7 before:absolute before:top-2 before:bottom-2 before:left-[1.1rem] before:w-px before:bg-line">
        {steps.map((step, i) => (
          <li key={i} className="relative flex gap-4">
            <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-xs font-semibold text-accent">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="pt-1.5 text-sm leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>
      <ul className="flex flex-col gap-3 border-t border-line pt-6 text-sm">
        {(['free', 'noPayment'] as const).map((key) => (
          <li key={key} className="flex items-center gap-3">
            <LineIcon name={key === 'free' ? 'shield' : 'cash'} className="size-6 text-accent" />
            {t(key)}
          </li>
        ))}
      </ul>
    </aside>
  )
}

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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section>
          <RequestForm service={service} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
        </section>
        <RequestProcess />
      </div>
    </div>
  )
}
