import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import type { MapPoint } from '@/components/map/map-canvas'
import { ProjectMap } from '@/components/map/project-map'
import { SectionHeading } from '@/components/sections/section-heading'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getProjects, projectPole } from '@/lib/queries'
import { localizedPath, pageMetadata } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Map' })
  return pageMetadata({ locale, path: '/realisations/carte', title: t('metaTitle'), description: t('metaDescription') })
}

/** Carte interactive des réalisations géolocalisées, avec la liste en repli accessible. */
export default async function MapPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, projects, portfolio] = await Promise.all([getTranslations('Map'), getProjects(locale), getTranslations('Projects')])

  const points: MapPoint[] = projects
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      city: p.city,
      year: p.year,
      pole: projectPole(p)?.title ?? '',
      href: localizedPath(locale, `/realisations/${p.slug}`),
      lat: p.latitude!,
      lng: p.longitude!,
    }))

  // Regroupement par ville pour la liste
  const byCity = Object.entries(
    points.reduce<Record<string, MapPoint[]>>((acc, p) => ((acc[p.city] ??= []).push(p), acc), {}),
  ).sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: portfolio('metaTitle'), href: '/realisations' }, { label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <ProjectMap points={points} />

      <section aria-labelledby="liste-carte" className="flex flex-col gap-5">
        <h2 id="liste-carte" className="flex flex-wrap items-baseline gap-3 text-2xl font-bold">
          {t('list')} <span className="font-mono text-sm font-normal text-muted">{t('count', { count: points.length })}</span>
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {byCity.map(([city, cityPoints]) => (
            <div key={city} className="flex flex-col gap-2">
              <h3 className="font-mono text-xs tracking-[0.12em] text-accent uppercase [font-stretch:100%]">
                {city} · {cityPoints.length}
              </h3>
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {cityPoints.map((p) => (
                  <li key={p.id}>
                    <Link href={`/realisations/${p.slug}`} className="flex min-h-11 items-center justify-between gap-3 py-2 hover:text-accent">
                      <span className="font-medium">{p.title}</span>
                      <span className="font-mono text-xs text-muted">{p.year}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
