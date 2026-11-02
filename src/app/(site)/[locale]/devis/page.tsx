import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { LineIcon, type LineIconName } from '@/components/ui/ornaments'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { QUOTE_SERVICES } from '@/lib/requests/services'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

const serviceIcons: Record<(typeof QUOTE_SERVICES)[number], LineIconName> = {
  architecture: 'house',
  peinture: 'brush',
  calligraphie: 'pen',
  serigraphie: 'print',
  dessin: 'pencil',
  prestation: 'handshake',
}

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
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {QUOTE_SERVICES.map((service, i) => (
          <Reveal as="li" key={service} delay={(i % 3) * 100}>
            <div className="group relative isolate flex h-full min-h-72 flex-col gap-5 overflow-hidden border border-line bg-surface p-8 transition-[color,border-color] duration-500 hover:border-forge hover:text-kaolin">
              {/* Aplat sombre qui monte au survol */}
              <span className="absolute inset-0 -z-10 translate-y-full bg-forge transition-transform duration-700 ease-expo group-hover:translate-y-0" aria-hidden />
              <div className="flex items-start justify-between">
                <LineIcon name={serviceIcons[service]} className="size-12 text-accent transition-colors duration-500 group-hover:text-sable" />
                <span className="font-display text-2xl text-muted tabular-nums transition-colors group-hover:text-kaolin/50">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="font-display text-3xl">
                <Link href={service === 'serigraphie' ? '/impression' : `/devis/${service}`} className="after:absolute after:inset-0">
                  {t(`services.${service}.title`)}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed text-muted transition-colors group-hover:text-kaolin/70">{t(`services.${service}.intro`)}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.2em] text-accent uppercase transition-all group-hover:gap-4 group-hover:text-sable">
                {t('choose')}
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
