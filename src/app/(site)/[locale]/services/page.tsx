import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getPoles } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Services' })
  return pageMetadata({ locale, path: '/services', title: t('metaTitle'), description: t('metaDescription') })
}

const toneBorder = { accent: 'border-accent', deep: 'border-deep', creative: 'border-creative' } as const

/** Liste des pôles qui ont une page de services. */
export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, poles] = await Promise.all([getTranslations('Services'), getPoles(locale)])
  const servicePoles = poles.filter((p) => p.hasServicePage)

  return (
    <div className="container-site flex flex-col gap-12 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('eyebrow') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />

      <ul className="flex flex-col gap-12">
        {servicePoles.map((pole, index) => (
          <li
            key={pole.id}
            className={cn(
              'grid gap-6 border-t-4 pt-6 md:grid-cols-[1fr_1.2fr] md:gap-10',
              toneBorder[pole.tone ?? 'accent'],
            )}
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-surface-sunken md:order-last">
              <MediaImage media={pole.image} sizes="(min-width: 768px) 50vw, 100vw" priority={index === 0} />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-extrabold">{pole.title}</h2>
              <p className="text-lg text-muted">{pole.summary}</p>
              {pole.services && pole.services.length > 0 && (
                <ul className="flex flex-col divide-y divide-line border-y border-line">
                  {pole.services.map((service) => (
                    <li key={service.id} className="py-2.5 font-medium">
                      {service.title}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/services/${pole.slug}`}
                className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-accent hover:underline"
              >
                {pole.title}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
