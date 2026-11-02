import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ClientMessages } from '@/components/i18n/client-messages'
import { ProjectCard } from '@/components/projects/project-card'
import { Counter } from '@/components/sections/counter'
import { HeroShowcase, type HeroInfoSlide } from '@/components/sections/hero-showcase'
import { SectionHeading } from '@/components/sections/section-heading'
import { ValueChain } from '@/components/sections/value-chain'
import { buttonVariants } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/media-image'
import { BlueprintFacade, ConstructionArcs, RotatingBadge, Squiggle } from '@/components/ui/ornaments'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { Media } from '@/payload-types'
import {
  getKeyFigures,
  getPartners,
  getPoles,
  getProducts,
  getProjects,
  getTestimonials,
  getTrainings,
  getUpcomingSessions,
  projectPole,
} from '@/lib/queries'
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

/** Grille des projets : trois colonnes, la colonne du milieu légèrement décalée vers le bas */
const projectLayout = ['', 'lg:mt-16', '', '', 'lg:mt-16', '']

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, common, poles, featured, allProjects, figures, testimonials, partners, settings, trainings, sessions, products] =
    await Promise.all([
      getTranslations('Home'),
      getTranslations('Common'),
      getPoles(locale),
      getProjects(locale, { featured: true, limit: 7 }),
      getProjects(locale),
      getKeyFigures(locale),
      getTestimonials(locale, 3),
      getPartners(),
      getSiteSettings(locale),
      getTrainings(locale),
      getUpcomingSessions(locale),
      getProducts(locale),
    ])

  // Diaporama du héros : une diapositive par grande activité, chacune avec un chiffre réel
  const firstFigure = figures.figures?.[0]
  const paintingProjects = allProjects.filter((p) => projectPole(p)?.key === 'peinture')
  const nextSession = sessions.find((s) => s.status === 'ouverte') ?? sessions[0]
  const productImage = products.map((p) => p.images?.[0]).find((m): m is Media => !!m && typeof m === 'object')
  const dateFmt = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Africa/Conakry' })
  const slide = (key: 'painting' | 'training' | 'shop' | 'simulator') => ({
    key,
    tab: t(`tabs.${key}`),
    eyebrow: t(`slides.${key}.eyebrow`),
    title: t(`slides.${key}.title`),
    text: t(`slides.${key}.text`),
    cta: { label: t(`slides.${key}.cta`), href: { painting: '/configurateur', training: '/formations', shop: '/boutique', simulator: '/simulateur' }[key] },
  })
  const heroSlides: HeroInfoSlide[] = [
    {
      key: 'architecture',
      tab: t('tabs.architecture'),
      eyebrow: t('eyebrow'),
      title: t('slides.architecture.title'),
      text: t('intro'),
      cta: { label: t('slides.architecture.cta'), href: '/devis' },
      stat: firstFigure
        ? { value: `${firstFigure.value}${firstFigure.suffix ?? ''}`, label: firstFigure.label }
        : { value: String(allProjects.length), label: t('slides.architecture.stat') },
      image: featured[0]?.coverImage,
    },
    {
      ...slide('painting'),
      stat: { value: String(paintingProjects.length), label: t('slides.painting.stat') },
      image: paintingProjects[0]?.coverImage ?? featured[1]?.coverImage,
    },
    {
      ...slide('training'),
      stat: nextSession
        ? { value: dateFmt.format(new Date(nextSession.startDate)), label: t('slides.training.stat') }
        : { value: String(trainings.length), label: t('slides.training.statNone') },
      image: trainings.find((x) => x.image)?.image ?? featured[2]?.coverImage,
    },
    {
      ...slide('shop'),
      stat: { value: String(products.length), label: t('slides.shop.stat') },
      image: productImage ?? featured[3]?.coverImage,
    },
    {
      ...slide('simulator'),
      stat: { value: t('slides.simulator.statValue'), label: t('slides.simulator.stat') },
      image: featured[4]?.coverImage ?? featured[0]?.coverImage,
    },
  ]
  const projects = featured.slice(0, projectLayout.length)
  const poleSlugs = Object.fromEntries(poles.map((p) => [p.key, p.slug]))
  const whatsapp = buildWhatsAppLink(settings.whatsappNumber, common('writeWhatsApp'))
  const ctaImage = featured[1]?.coverImage ?? featured[0]?.coverImage

  return (
    <>
      {/* Héros : diaporama d'informations (pôles, formation, boutique, simulateur) */}
      <HeroShowcase
        slides={heroSlides}
        ticker={t.raw('ticker') as string[]}
        labels={{ badge: t('badge'), slides: t('heroSlides'), secondary: { label: common('seeProjects'), href: '/realisations' } }}
      />

      {/* Le studio : manifeste et chiffres clés */}
      <section className="container-site grid gap-12 py-24 sm:py-32 lg:grid-cols-12" aria-labelledby="studio">
        <Reveal className="relative flex flex-col gap-10 lg:col-span-4" variant="left">
          <p className="eyebrow">{t('studioEyebrow')}</p>
          <div className="relative hidden aspect-square max-w-xs lg:block">
            <ConstructionArcs className="is-visible absolute inset-0 text-line" />
            <BlueprintFacade className="absolute inset-8 text-ink/80" />
            <RotatingBadge text={t('badge')} className="absolute -right-6 -bottom-6 size-28 text-muted" />
          </div>
        </Reveal>
        <div className="flex flex-col gap-10 lg:col-span-8">
          <Reveal>
            <h2 id="studio" className="display-title font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              {t.rich('studioTitle', { em: (chunks) => <em>{chunks}</em> })}
            </h2>
          </Reveal>
          <Reveal className="grid gap-8 sm:grid-cols-2" delay={120}>
            <p className="text-lg leading-relaxed text-muted">{t('intro')}</p>
            <div className="flex flex-col items-start gap-6">
              <p className="leading-relaxed text-muted">{t('studioText')}</p>
              <Link href="/a-propos" className="link-arrow">
                {t('discover')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>

        {figures.figures && figures.figures.length > 0 && (
          <dl aria-label={t('figuresTitle')} className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 lg:col-span-12 lg:grid-cols-4">
            {figures.figures.map((figure, i) => (
              <Reveal key={figure.id} delay={i * 100} className="flex flex-col-reverse gap-2">
                <dt className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">{figure.label}</dt>
                <dd className="font-display text-6xl leading-none sm:text-7xl">
                  <Counter value={figure.value} suffix={figure.suffix} />
                  <Squiggle className="mt-2 block h-3 w-24 text-accent" />
                </dd>
              </Reveal>
            ))}
          </dl>
        )}
      </section>

      {/* Les 8 pôles : liste éditoriale numérotée */}
      <section className="border-t border-line bg-surface" aria-labelledby="poles">
        <div className="container-site flex flex-col gap-14 py-24 sm:py-32">
          <SectionHeading id="poles" eyebrow={t('polesEyebrow')} title={t('polesTitle')}>
            <Link href="/services" className="link-arrow shrink-0">
              {t('allServices')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </SectionHeading>
          <ul className="border-t border-line">
            {poles.map((pole, index) => (
              <li key={pole.id} className="group relative border-b border-line">
                <div className="grid items-baseline gap-x-8 gap-y-2 py-7 transition-[padding] duration-500 sm:grid-cols-[4rem_1fr_auto] lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_auto] lg:group-hover:pl-4">
                  <span className="text-sm tabular-nums text-muted">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-3xl transition-colors group-hover:text-accent sm:text-4xl">
                    <Link href={`/services/${pole.slug}`} className="after:absolute after:inset-0">
                      {pole.title}
                    </Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted sm:col-start-2 lg:col-start-auto">{pole.summary}</p>
                  <ArrowUpRight
                    className="hidden size-6 self-center text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-accent sm:block sm:row-start-1 sm:col-start-3 lg:col-start-4"
                    aria-hidden
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Projets phares : grille éditoriale décalée */}
      {projects.length > 0 && (
        <section className="container-site flex flex-col gap-16 py-24 sm:py-32" aria-labelledby="projets">
          <SectionHeading id="projets" eyebrow={t('featuredEyebrow')} title={t('featuredTitle')}>
            <Link href="/realisations" className="link-arrow shrink-0">
              {t('allProjects')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </SectionHeading>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} className={projectLayout[i]} delay={(i % 3) * 120}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Chaîne de valeur interactive */}
      <section className="border-y border-line bg-surface" aria-labelledby="chaine">
        <div className="container-site flex flex-col gap-12 py-24 sm:py-32">
          <SectionHeading id="chaine" eyebrow={t('chainEyebrow')} title={t('chainTitle')} intro={t('chainIntro')} />
          <ClientMessages namespaces={['Chain']}>
            <ValueChain poleSlugs={poleSlugs} />
          </ClientMessages>
        </div>
      </section>

      {/* Outils en ligne : simulateur, configurateur, carte */}
      <section className="bg-forge text-kaolin" aria-labelledby="outils">
        <div className="container-site flex flex-col gap-14 py-24 sm:py-32 [--line:rgba(255,255,255,0.14)] [--muted:rgba(245,242,236,0.65)] [--accent:var(--sable)]">
          <SectionHeading id="outils" eyebrow={t('toolsEyebrow')} title={t('toolsTitle')} />
          <ul className="grid border-t border-line md:grid-cols-3">
            {(
              [
                { key: 'simulator', href: '/simulateur' },
                { key: 'configurator', href: '/configurateur' },
                { key: 'map', href: '/realisations/carte' },
              ] as const
            ).map(({ key, href }, i) => (
              <li
                key={key}
                className="group relative flex min-h-72 flex-col gap-4 border-b border-line py-10 transition-colors md:border-b-0 md:px-8 md:not-first:border-l md:first:pl-0 hover:bg-white/[0.03]"
              >
                <span className="text-sm tabular-nums text-muted">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-3xl">
                  <Link href={href} className="after:absolute after:inset-0">
                    {t(`tools.${key}.title`)}
                  </Link>
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted">{t(`tools.${key}.text`)}</p>
                <ArrowRight className="mt-auto size-6 text-sable transition-transform duration-500 group-hover:translate-x-2" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Témoignages */}
      {testimonials.length > 0 && (
        <section className="container-site flex flex-col gap-14 py-24 sm:py-32" aria-labelledby="temoignages">
          <SectionHeading id="temoignages" eyebrow={t('testimonialsEyebrow')} title={t('testimonialsTitle')} />
          <div className="grid gap-12 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.id} delay={i * 120} as="article">
                <figure className="flex h-full flex-col gap-6 border-t border-ink pt-8">
                  <span className="font-display text-7xl leading-[0.5] text-accent" aria-hidden>
                    “
                  </span>
                  <blockquote className="font-display text-2xl leading-snug">{item.quote}</blockquote>
                  <figcaption className="mt-auto flex flex-col gap-1 pt-4">
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase">{item.author}</span>
                    {item.context && <span className="text-sm text-muted">{item.context}</span>}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Partenaires : bandeau défilant */}
      {partners.length > 0 && (
        <section className="overflow-hidden border-y border-line py-12" aria-labelledby="partenaires">
          <h2 id="partenaires" className="sr-only">
            {t('partnersTitle')}
          </h2>
          <ul className="marquee flex w-max items-center gap-16 pr-16">
            {[...partners, ...partners].map((partner, i) => (
              <li
                key={`${partner.id}-${i}`}
                aria-hidden={i >= partners.length}
                className="flex items-center gap-16 font-display text-3xl whitespace-nowrap text-muted"
              >
                {partner.url && i < partners.length ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                    {partner.name}
                  </a>
                ) : (
                  partner.name
                )}
                <span className="text-accent" aria-hidden>
                  ✦
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Appel à l'action : grande image, titre en serif */}
      <section className="container-site pt-24 sm:pt-32">
        <div className="relative isolate overflow-hidden bg-forge px-6 py-20 text-white sm:px-14 sm:py-28">
          {ctaImage && (
            <div className="absolute inset-0 -z-10 opacity-45">
              <MediaImage media={ctaImage} sizes="(min-width: 1344px) 1280px, 100vw" />
            </div>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/20" aria-hidden />
          <div className="flex max-w-3xl flex-col gap-7">
            <p className="eyebrow text-white/70 [--accent:var(--sable)]">{t('ctaEyebrow')}</p>
            <h2 className="font-display text-5xl leading-[1.02] sm:text-7xl">{t('ctaTitle')}</h2>
            <p className="max-w-xl text-lg text-white/80">{t('ctaText')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/devis" className={buttonVariants({ size: 'lg' })}>
                {common('requestQuote')}
                <ArrowRight aria-hidden />
              </Link>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-white/50 text-white hover:border-white hover:bg-white hover:text-forge')}
                >
                  <MessageCircle aria-hidden />
                  {common('writeWhatsApp')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
