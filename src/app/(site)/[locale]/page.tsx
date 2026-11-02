import { ArrowRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProjectCard } from '@/components/projects/project-card'
import { Counter } from '@/components/sections/counter'
import { SectionHeading } from '@/components/sections/section-heading'
import { ValueChain } from '@/components/sections/value-chain'
import { buttonVariants } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getKeyFigures, getPartners, getPoles, getProjects, getTestimonials } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { cn } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'

// Page régénérée au plus toutes les heures (et immédiatement après une modification au back-office)
export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata({ locale, path: '/' })
}

const toneClasses = {
  accent: 'text-accent',
  deep: 'text-deep',
  creative: 'text-creative',
} as const

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, common, poles, featured, figures, testimonials, partners, settings] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Common'),
    getPoles(locale),
    getProjects(locale, { featured: true, limit: 7 }),
    getKeyFigures(locale),
    getTestimonials(locale, 3),
    getPartners(),
    getSiteSettings(locale),
  ])

  const heroProject = featured[0]
  // Grille de 3 colonnes : on garde un multiple de 3 pour ne pas laisser de ligne incomplète
  const rest = featured.slice(1)
  const featuredCards = rest.length > 3 ? rest.slice(0, rest.length - (rest.length % 3)) : rest
  const poleSlugs = Object.fromEntries(poles.map((p) => [p.key, p.slug]))
  const whatsapp = buildWhatsAppLink(settings.whatsappNumber, common('writeWhatsApp'))

  return (
    <>
      {/* Héros : la promesse à gauche, un projet phare à droite */}
      <section className="container-site grid items-center gap-10 pt-10 pb-14 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <p className="eyebrow hero-rise">{t('eyebrow')}</p>
          <h1 className="hero-rise text-4xl font-extrabold tracking-tight [font-stretch:118%] sm:text-5xl xl:text-[4.5rem]">
            {t('title')}
          </h1>
          <div className="frise-leppi hero-frise w-40" aria-hidden />
          <p className="hero-rise hero-rise-delay max-w-[58ch] text-lg text-muted">{t('intro')}</p>
          <div className="hero-rise hero-rise-delay flex flex-wrap gap-3">
            <Link href="/devis" className={buttonVariants({ size: 'lg' })}>
              {common('requestQuote')}
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/realisations" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {common('seeProjects')}
            </Link>
          </div>
        </div>

        {heroProject && (
          <Link href={`/realisations/${heroProject.slug}`} className="group relative block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-sunken sm:aspect-[4/3] lg:aspect-[4/5]">
              <MediaImage
                media={heroProject.coverImage}
                sizes="(min-width: 1024px) 45vw, 100vw"
                priority
                className="transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            {/* Cartouche façon plan d'architecte */}
            <div className="absolute right-3 bottom-3 left-3 flex flex-col gap-0.5 rounded-sm bg-bg/92 p-3 font-mono text-xs backdrop-blur-sm sm:left-auto sm:min-w-64">
              <span className="text-sm font-semibold [font-family:var(--font-sans)]">{heroProject.title}</span>
              <span className="text-muted">
                {heroProject.city} · {heroProject.year}
                {heroProject.surface ? ` · ${heroProject.surface} m²` : ''}
              </span>
            </div>
          </Link>
        )}
      </section>

      {/* Chiffres clés */}
      {figures.figures && figures.figures.length > 0 && (
        <section aria-labelledby="chiffres" className="bg-fouta text-kaolin">
          <h2 id="chiffres" className="sr-only">
            {t('figuresTitle')}
          </h2>
          <dl className="container-site grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:py-12 lg:grid-cols-4">
            {figures.figures.map((figure) => (
              <div key={figure.id} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-kaolin/80">{figure.label}</dt>
                <dd className="font-display text-4xl font-extrabold [font-stretch:118%] sm:text-5xl">
                  <Counter value={figure.value} suffix={figure.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Les 8 pôles */}
      <section className="container-site flex flex-col gap-8 py-16 sm:py-20" aria-labelledby="poles">
        <SectionHeading id="poles" eyebrow={t('polesEyebrow')} title={t('polesTitle')} />
        <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {poles.map((pole, index) => (
            <li key={pole.id} className="relative flex flex-col gap-3 bg-surface p-5 transition-colors hover:bg-bg">
              <span className={cn('font-mono text-sm tabular-nums', toneClasses[pole.tone ?? 'accent'])}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-bold">
                <Link href={`/services/${pole.slug}`} className="after:absolute after:inset-0">
                  {pole.title}
                </Link>
              </h3>
              <p className="text-sm text-muted">{pole.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Chaîne de valeur interactive */}
      <section className="border-y border-line bg-surface-sunken/60" aria-labelledby="chaine">
        <div className="container-site flex flex-col gap-8 py-16 sm:py-20">
          <SectionHeading id="chaine" eyebrow={t('chainEyebrow')} title={t('chainTitle')} intro={t('chainIntro')} />
          <ValueChain poleSlugs={poleSlugs} />
        </div>
      </section>

      {/* Projets phares */}
      {featuredCards.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-16 sm:py-20" aria-labelledby="projets">
          <SectionHeading id="projets" eyebrow={t('featuredEyebrow')} title={t('featuredTitle')}>
            <Link href="/realisations" className={buttonVariants({ variant: 'outline' })}>
              {t('allProjects')}
              <ArrowRight aria-hidden />
            </Link>
          </SectionHeading>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCards.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section className="bg-leppi text-kaolin" aria-labelledby="temoignages">
          <div className="container-site flex flex-col gap-10 py-16 sm:py-20">
            <h2 id="temoignages" className="text-3xl font-extrabold sm:text-4xl">
              {t('testimonialsTitle')}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((item) => (
                <figure key={item.id} className="flex flex-col gap-4 border-t border-kaolin/25 pt-5">
                  <blockquote className="text-lg leading-relaxed">« {item.quote} »</blockquote>
                  <figcaption className="mt-auto flex flex-col text-sm">
                    <span className="font-semibold">{item.author}</span>
                    {item.context && <span className="text-kaolin/75">{item.context}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className="container-site flex flex-col gap-6 py-14" aria-labelledby="partenaires">
          <h2 id="partenaires" className="eyebrow [font-family:var(--font-mono)] [font-stretch:100%]">
            {t('partnersTitle')}
          </h2>
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {partners.map((partner) => (
              <li key={partner.id} className="font-display text-lg font-bold text-muted [font-stretch:110%]">
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                    {partner.name}
                  </a>
                ) : (
                  partner.name
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="container-site pt-6">
        <div className="flex flex-col gap-6 rounded-md bg-laterite p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{t('ctaTitle')}</h2>
            <p className="text-white/90">{t('ctaText')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/devis" className={buttonVariants({ size: 'lg', className: 'bg-white text-laterite hover:bg-kaolin' })}>
              {common('requestQuote')}
            </Link>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: 'lg', variant: 'outline', className: 'border-white/60 text-white hover:bg-white/10 hover:border-white' })}
              >
                <MessageCircle aria-hidden />
                {common('writeWhatsApp')}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
