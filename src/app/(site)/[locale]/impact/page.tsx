import config from '@payload-config'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Counter } from '@/components/sections/counter'
import { buttonVariants } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getProjects } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Impact' })
  return pageMetadata({ locale, path: '/impact', title: t('metaTitle'), description: t('metaDescription') })
}

const axisColor = { emploi: 'border-accent', formation: 'border-creative', durable: 'border-deep', territoire: 'border-sable' } as const

/** Page « Impact » : indicateurs du back-office en compteurs animés, récits, présence territoriale. */
export default async function ImpactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const payload = await getPayload({ config })
  const [t, impact, projects] = await Promise.all([
    getTranslations('Impact'),
    payload.findGlobal({ slug: 'impact-page', locale, depth: 1, overrideAccess: false }),
    getProjects(locale),
  ])

  // Présence territoriale calculée à partir des réalisations publiées
  const cities = Object.entries(projects.reduce<Record<string, number>>((acc, p) => ((acc[p.city] = (acc[p.city] ?? 0) + 1), acc), {})).sort(
    (a, b) => b[1] - a[1],
  )
  const maxCity = cities[0]?.[1] ?? 1

  return (
    <div className="flex flex-col">
      <header className="container-site flex flex-col gap-6 py-10 sm:py-14">
        <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{t('title')}</h1>
        {impact.intro && <p className="max-w-[62ch] text-lg text-muted">{impact.intro}</p>}
      </header>

      {impact.figures && impact.figures.length > 0 && (
        <section aria-label={t('eyebrow')} className="container-site">
          <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {impact.figures.map((figure) => (
              <div key={figure.id} className={cn('flex flex-col-reverse gap-2 border-t-4 bg-surface p-6', axisColor[figure.axis ?? 'emploi'])}>
                <dd className="text-sm text-muted">{figure.detail}</dd>
                <dt className="flex flex-col gap-1">
                  <span className="font-mono text-xs tracking-[0.1em] text-muted uppercase">{t(`axes.${figure.axis ?? 'emploi'}`)}</span>
                  <span className="font-display text-5xl font-extrabold [font-stretch:118%]">
                    <Counter value={figure.value} suffix={figure.suffix} />
                  </span>
                  <span className="font-semibold">{figure.label}</span>
                </dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {impact.stories && impact.stories.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-16" aria-labelledby="recits">
          <h2 id="recits" className="text-3xl font-extrabold">
            {t('stories')}
          </h2>
          <ul className="grid gap-10 md:grid-cols-3">
            {impact.stories.map((story) => (
              <li key={story.id} className="flex flex-col gap-3">
                <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-surface-sunken">
                  <MediaImage media={story.image} sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
                <h3 className="text-xl font-bold">{story.title}</h3>
                {story.text && <p className="text-muted">{story.text}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cities.length > 0 && (
        <section className="border-t border-line bg-surface" aria-labelledby="villes">
          <div className="container-site flex flex-col gap-6 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="villes" className="text-3xl font-extrabold">
                {t('byCity')}
              </h2>
              <Link href="/realisations/carte" className={buttonVariants({ variant: 'outline' })}>
                {t('seeMap')}
                <ArrowRight aria-hidden />
              </Link>
            </div>
            {/* Barres proportionnelles au nombre de projets par ville */}
            <ul className="flex flex-col gap-3">
              {cities.map(([city, count]) => (
                <li key={city} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2rem]">
                  <span className="font-semibold">{city}</span>
                  <span className="h-3 overflow-hidden rounded-sm bg-surface-sunken">
                    <span className="block h-full bg-accent" style={{ width: `${(count / maxCity) * 100}%` }} />
                  </span>
                  <span className="text-right font-mono tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
