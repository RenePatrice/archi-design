import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectFilters, type FilterableProject } from '@/components/projects/project-filters'
import { SectionHeading } from '@/components/sections/section-heading'
import type { Locale } from '@/i18n/routing'
import { getPoles, getProjects, projectPole } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Projects' })
  return pageMetadata({ locale, path: '/realisations', title: t('metaTitle'), description: t('metaDescription') })
}

/** Portfolio filtrable. Les cartes sont rendues côté serveur, le filtrage se fait dans le navigateur. */
export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, projects, poles] = await Promise.all([getTranslations('Projects'), getProjects(locale), getPoles(locale)])

  const filterable: FilterableProject[] = projects.map((p) => ({
    id: p.id,
    pole: projectPole(p)?.key ?? '',
    type: p.type,
    city: p.city,
    year: p.year,
  }))
  const cards = Object.fromEntries(projects.map((p, i) => [p.id, <ProjectCard key={p.id} project={p} priority={i < 2} />]))
  // On ne propose que les pôles qui ont au moins un projet
  const usedPoles = poles.filter((pole) => filterable.some((p) => p.pole === pole.key)).map((p) => ({ key: p.key, label: p.title }))

  // Liste complète sans filtre, affichée pendant le chargement de la partie interactive
  const fallback = (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <li key={p.id}>{cards[p.id]}</li>
      ))}
    </ul>
  )

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <Suspense fallback={fallback}>
        <ProjectFilters projects={filterable} poles={usedPoles} cards={cards} />
      </Suspense>
    </div>
  )
}
