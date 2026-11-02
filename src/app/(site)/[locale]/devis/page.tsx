import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { QUOTE_SERVICES } from '@/lib/requests/services'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Requests' })
  return pageMetadata({ locale, path: '/devis', title: t('metaTitle'), description: t('metaDescription') })
}

/** Choix du service avant le formulaire de devis. L'impression a sa page avec calcul de prix. */
export default async function QuotePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Requests')

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {QUOTE_SERVICES.map((service) => (
          <li key={service} className="relative flex flex-col gap-3 bg-surface p-6 transition-colors hover:bg-bg">
            <h2 className="text-xl font-bold">
              <Link href={service === 'serigraphie' ? '/impression' : `/devis/${service}`} className="after:absolute after:inset-0">
                {t(`services.${service}.title`)}
              </Link>
            </h2>
            <p className="text-sm text-muted">{t(`services.${service}.intro`)}</p>
            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent">
              {t('choose')}
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
