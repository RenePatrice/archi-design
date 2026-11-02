import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { BeforeAfter } from '@/components/projects/before-after'
import { Gallery, type GalleryImage } from '@/components/projects/gallery'
import { ModelViewer } from '@/components/projects/model-viewer'
import { ProjectCard } from '@/components/projects/project-card'
import { JsonLd } from '@/components/seo/json-ld'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/card'
import { MediaImage, mediaPath } from '@/components/ui/media-image'
import { RichText } from '@/components/ui/rich-text'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { quoteHref } from '@/lib/navigation'
import { getProjectBySlug, getProjects, projectPole } from '@/lib/queries'
import { absoluteUrl, pageMetadata, siteUrl } from '@/lib/seo'
import type { Media, Model } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    limit: 500,
    depth: 0,
    overrideAccess: false,
    select: { slug: true },
  })
  return routing.locales.flatMap((locale) => docs.map((d) => ({ locale, slug: d.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const project = await getProjectBySlug(locale, slug)
  if (!project) return {}
  const cover = typeof project.coverImage === 'object' ? project.coverImage : null
  return pageMetadata({
    locale,
    path: `/realisations/${slug}`,
    title: `${project.title} · ${project.city}`,
    description: project.summary,
    image: cover?.sizes?.hero?.url ?? cover?.url,
  })
}

const asMedia = (value: unknown): Media | null => (value && typeof value === 'object' ? (value as Media) : null)

/** Fiche projet : description, fiche technique, galerie plein écran, avant/après. */
export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const project = await getProjectBySlug(locale, slug)
  if (!project) notFound()

  const pole = projectPole(project)
  const [t, types, common, sameProjects] = await Promise.all([
    getTranslations('Projects'),
    getTranslations('ProjectTypes'),
    getTranslations('Common'),
    getProjects(locale, { poleId: pole?.id, limit: 4 }),
  ])
  const related = sameProjects.filter((p) => p.id !== project.id).slice(0, 3)

  const galleryImages: GalleryImage[] = (project.gallery ?? [])
    .map((item) => asMedia(item.image))
    .filter((m): m is Media => Boolean(m?.url))
    .map((m) => ({
      id: String(m.id),
      url: mediaPath(m.sizes?.hero?.url ?? m.url!),
      thumbUrl: mediaPath(m.sizes?.card?.url ?? m.url!),
      alt: m.alt,
      caption: m.caption,
      width: m.width ?? 1600,
      height: m.height ?? 1200,
    }))

  // Maquette 3D éventuelle (relation chargée grâce à depth: 2)
  const model = project.model && typeof project.model === 'object' ? (project.model as Model) : null
  const modelPoster = model?.poster && typeof model.poster === 'object' ? (model.poster as Media) : asMedia(project.coverImage)
  const model3d = await getTranslations('Model3D')

  const before = asMedia(project.beforeImage)
  const after = asMedia(project.afterImage)

  // Fiche technique : seules les lignes renseignées s'affichent
  const sheet = [
    { label: t('location'), value: [project.city, project.country].filter(Boolean).join(', ') },
    { label: t('year'), value: String(project.year) },
    { label: t('type'), value: types(project.type) },
    { label: t('surface'), value: project.surface ? `${new Intl.NumberFormat(locale).format(project.surface)} m²` : null },
    { label: t('duration'), value: project.duration },
    { label: t('budget'), value: project.budgetRange },
  ].filter((row) => row.value)

  return (
    <article className="flex flex-col">
      <header className="container-site flex flex-col gap-6 pt-10 pb-8 sm:pt-14">
        <Breadcrumbs
          locale={locale}
          items={[{ label: t('metaTitle'), href: '/realisations' }, { label: project.title }]}
        />
        <div className="flex flex-wrap gap-2">
          {pole && <Badge tone={pole.tone ?? 'accent'}>{pole.title}</Badge>}
          <Badge>{types(project.type)}</Badge>
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{project.title}</h1>
        <p className="max-w-[60ch] text-lg text-muted">{project.summary}</p>
      </header>

      <div className="container-site">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-sunken">
          <MediaImage media={project.coverImage} sizes="(min-width: 1216px) 1216px, 100vw" priority />
        </div>
      </div>

      <div className="container-site grid gap-12 py-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-10">
          <RichText data={project.description} className="text-lg" />

          {project.clientQuote && (
            <figure className="flex flex-col gap-2 border-l-4 border-creative pl-5">
              <figcaption className="eyebrow">{t('clientWord')}</figcaption>
              <blockquote className="text-xl leading-relaxed">« {project.clientQuote} »</blockquote>
            </figure>
          )}

          {model?.url && (
            <section aria-labelledby="maquette" className="flex flex-col gap-4">
              <h2 id="maquette" className="text-2xl font-bold">
                {model3d('title')}
              </h2>
              <ModelViewer
                src={mediaPath(model.url)}
                poster={modelPoster?.url ? mediaPath(modelPoster.sizes?.card?.url ?? modelPoster.url) : null}
                alt={model.title}
                cameraOrbit={model.cameraOrbit}
                sizeLabel={`${((model.filesize ?? 0) / 1_048_576).toLocaleString(locale, { maximumFractionDigits: 1 })} Mo`}
              />
            </section>
          )}

          {before?.url && after?.url && (
            <section aria-labelledby="avant-apres" className="flex flex-col gap-4">
              <h2 id="avant-apres" className="text-2xl font-bold">
                {t('beforeAfter')}
              </h2>
              <BeforeAfter
                before={<MediaImage media={before} sizes="(min-width: 1024px) 60vw, 100vw" />}
                after={<MediaImage media={after} sizes="(min-width: 1024px) 60vw, 100vw" />}
              />
            </section>
          )}

          {galleryImages.length > 0 && (
            <section aria-labelledby="galerie" className="flex flex-col gap-4">
              <h2 id="galerie" className="text-2xl font-bold">
                {t('gallery')}
              </h2>
              <Gallery images={galleryImages} />
            </section>
          )}
        </div>

        {/* Fiche technique façon cartouche de plan */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="fiche" className="rounded-md border border-line bg-surface">
            <h2 id="fiche" className="border-b border-line px-5 py-3 font-mono text-xs tracking-[0.12em] uppercase [font-stretch:100%]">
              {t('sheet')}
            </h2>
            <dl className="divide-y divide-line">
              {sheet.map((row) => (
                <div key={row.label} className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-3 text-sm">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-medium">{row.value}</dd>
                </div>
              ))}
              {project.materials && project.materials.length > 0 && (
                <div className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-3 text-sm">
                  <dt className="text-muted">{t('materials')}</dt>
                  <dd>
                    <ul className="flex flex-col gap-1 font-medium">
                      {project.materials.map((m) => (
                        <li key={m.id}>{m.name}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>
          <div className="flex flex-col gap-3 rounded-md bg-surface-sunken p-5">
            <p className="font-display text-xl font-bold [font-stretch:110%]">{t('similarQuote')}</p>
            <Link href={quoteHref(pole?.key)} className={buttonVariants({ className: 'self-start' })}>
              {common('requestQuote')}
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-10" aria-labelledby="autres">
          <h2 id="autres" className="text-3xl font-extrabold">
            {t('related')}
          </h2>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.summary,
          url: absoluteUrl(locale, `/realisations/${project.slug}`),
          dateCreated: String(project.year),
          locationCreated: { '@type': 'Place', name: project.city, address: { '@type': 'PostalAddress', addressLocality: project.city } },
          creator: { '@id': `${siteUrl}/#entreprise` },
        }}
      />
    </article>
  )
}
