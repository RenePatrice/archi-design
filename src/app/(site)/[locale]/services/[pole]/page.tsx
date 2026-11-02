import config from '@payload-config'
import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ProjectCard } from '@/components/projects/project-card'
import { JsonLd } from '@/components/seo/json-ld'
import { buttonVariants } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/media-image'
import { RichText } from '@/components/ui/rich-text'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { quoteHref } from '@/lib/navigation'
import { getPoleBySlug, getPoles, getProjects } from '@/lib/queries'
import { absoluteUrl, pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; pole: string }> }

/** Pré-génère une page par pôle et par langue. */
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'poles', limit: 50, depth: 0, select: { slug: true } })
  return routing.locales.flatMap((locale) => docs.map((d) => ({ locale, pole: d.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pole: slug } = await params
  const pole = await getPoleBySlug(locale, slug)
  if (!pole) return {}
  const image = typeof pole.image === 'object' ? pole.image?.sizes?.card?.url : null
  return pageMetadata({ locale, path: `/services/${slug}`, title: pole.title, description: pole.summary, image })
}

export default async function PolePage({ params }: Props) {
  const { locale, pole: slug } = await params
  setRequestLocale(locale)

  const pole = await getPoleBySlug(locale, slug)
  if (!pole) notFound()

  const [t, common, poles, projects, settings] = await Promise.all([
    getTranslations('Services'),
    getTranslations('Common'),
    getPoles(locale),
    getProjects(locale, { poleId: pole.id, limit: 6 }),
    getSiteSettings(locale),
  ])

  // Pôle suivant dans la chaîne de valeur, pour inciter à découvrir les autres services
  const index = poles.findIndex((p) => p.id === pole.id)
  const next = poles[(index + 1) % poles.length]
  const whatsapp = buildWhatsAppLink(settings.whatsappNumber, pole.whatsappMessage || `${pole.title} : ${common('requestQuote')}`)

  return (
    <article className="flex flex-col">
      <header className="container-site flex flex-col gap-8 py-10 sm:py-14">
        <Breadcrumbs locale={locale} items={[{ label: t('eyebrow'), href: '/services' }, { label: pole.title }]} />
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-5">
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="text-4xl font-extrabold tracking-tight [font-stretch:118%] sm:text-5xl">{pole.title}</h1>
            <p className="max-w-[58ch] text-lg text-muted">{pole.summary}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={quoteHref(pole.key)} className={buttonVariants({ size: 'lg' })}>
                {t('askQuote', { pole: pole.title.toLowerCase() })}
              </Link>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                  <MessageCircle aria-hidden />
                  {t('askWhatsApp')}
                </a>
              )}
            </div>
          </div>
          <div className="relative aspect-[3/2] max-h-[440px] w-full overflow-hidden bg-surface-sunken">
            <MediaImage media={pole.image} sizes="(min-width: 1024px) 45vw, 100vw" priority />
          </div>
        </div>
      </header>

      <div className="container-site grid gap-12 py-6 lg:grid-cols-[1.4fr_1fr]">
        <RichText data={pole.description} className="text-lg" />

        {pole.services && pole.services.length > 0 && (
          <section aria-labelledby="prestations" className="flex flex-col gap-4">
            <h2 id="prestations" className="text-2xl font-bold">
              {t('whatWeDo')}
            </h2>
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {pole.services.map((service) => (
                <li key={service.id} className="flex flex-col gap-1 py-4">
                  <h3 className="text-base font-bold [font-family:var(--font-sans)] [font-stretch:100%]">{service.title}</h3>
                  {service.text && <p className="text-sm text-muted">{service.text}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {projects.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-14" aria-labelledby="realisations-pole">
          <h2 id="realisations-pole" className="text-3xl font-extrabold">
            {t('relatedProjects')}
          </h2>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Étape suivante de la chaîne de valeur */}
      {next && next.id !== pole.id && (
        <section className="container-site pt-6">
          <Link
            href={`/services/${next.slug}`}
            className="group flex flex-col gap-2 rounded-md border border-line bg-surface p-6 transition-colors hover:border-accent sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <span className="flex flex-col gap-1">
              <span className="eyebrow">{t('next')}</span>
              <span className="font-display text-2xl font-bold [font-stretch:112%]">{next.title}</span>
              {next.pack && <span className="max-w-[60ch] text-muted">{next.pack}</span>}
            </span>
            <ArrowRight className="size-8 shrink-0 text-accent transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </section>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: pole.title,
          description: pole.summary,
          url: absoluteUrl(locale, `/services/${pole.slug}`),
          areaServed: 'GN',
          provider: { '@id': `${absoluteUrl(routing.defaultLocale, '/').replace(/\/$/, '')}/#entreprise` },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: pole.title,
            itemListElement: (pole.services ?? []).map((s) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: s.title },
            })),
          },
        }}
      />
    </article>
  )
}
