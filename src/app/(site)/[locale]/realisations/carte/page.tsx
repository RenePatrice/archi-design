import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import type { MapPoint } from '@/components/map/map-canvas'
import { ProjectMap } from '@/components/map/project-map'
import { SectionHeading } from '@/components/sections/section-heading'
import { mediaPath } from '@/components/ui/media-image'
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
      image: typeof p.coverImage === 'object' && p.coverImage?.url ? mediaPath(p.coverImage.sizes?.card?.url ?? p.coverImage.url) : null,
    }))

  const stats = [
    [points.length, t('stats.projects')],
    [new Set(points.map((p) => p.city)).size, t('stats.cities')],
    [new Set(points.map((p) => p.pole).filter(Boolean)).size, t('stats.poles')],
  ] as const

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: portfolio('metaTitle'), href: '/realisations' }, { label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <dl className="grid grid-cols-3 border-y border-line">
        {stats.map(([value, label]) => (
          <div key={label} className="flex flex-col-reverse gap-1 py-6 not-first:border-l not-first:border-line not-first:pl-6">
            <dt className="text-[0.625rem] font-semibold tracking-[0.2em] text-muted uppercase">{label}</dt>
            <dd className="font-display text-5xl leading-none">{value}</dd>
          </div>
        ))}
      </dl>
      <ProjectMap points={points} />
    </div>
  )
}
