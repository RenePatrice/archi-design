import config from '@payload-config'
import { Award, CalendarDays, Check, Clock, GraduationCap, Layers, User } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { EnrollmentForm } from '@/components/forms/enrollment-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { MediaImage } from '@/components/ui/media-image'
import { Reveal } from '@/components/ui/reveal'
import { RichText } from '@/components/ui/rich-text'
import { routing, type Locale } from '@/i18n/routing'
import { formatSessionDates } from '@/lib/dates'
import { getPrivacySlug, getTrainingBySlug, getUpcomingSessions } from '@/lib/queries'
import { formatGNF } from '@/lib/requests/print-pricing'
import { absoluteUrl, pageMetadata, siteUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'trainings', limit: 200, depth: 0, select: { slug: true } })
  return routing.locales.flatMap((locale) => docs.map((d) => ({ locale, slug: d.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const training = await getTrainingBySlug(locale, slug)
  if (!training) return {}
  return pageMetadata({ locale, path: `/formations/${slug}`, title: training.title, description: training.summary })
}

/**
 * Fiche formation, façon plateforme de cours : bandeau sombre, carte d'inscription,
 * « ce que vous apprendrez », programme en accordéon, formateur, inscription en ligne.
 */
export default async function TrainingPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const training = await getTrainingBySlug(locale, slug)
  if (!training) notFound()

  const [t, requests, sessions, settings, privacySlug] = await Promise.all([
    getTranslations('Training'),
    getTranslations('Requests'),
    getUpcomingSessions(locale, training.id),
    getSiteSettings(locale),
    getPrivacySlug(locale),
  ])

  const openSessions = sessions
    .filter((s) => s.status === 'ouverte')
    .map((s) => {
      const dates = formatSessionDates(locale, s.startDate, s.endDate)
      const when = dates.end ? t('from', { start: dates.start, end: dates.end }) : t('on', { start: dates.start })
      return { id: s.id, label: `${when} · ${s.location ?? ''}${s.seats ? ` · ${t('seats', { count: s.seats })}` : ''}` }
    })
  const next = sessions.find((s) => s.status === 'ouverte')
  const nextDates = next ? formatSessionDates(locale, next.startDate, next.endDate) : null
  const program = training.program ?? []
  const price = training.price ? formatGNF(training.price, locale) : t('onQuote')

  const facts = [
    { icon: GraduationCap, value: t(`levels.${training.level ?? 'tous'}`) },
    { icon: Clock, value: training.duration },
    { icon: Layers, value: program.length ? t('modules', { count: program.length }) : null },
    { icon: Award, value: training.certificate ? t('certificate') : null },
  ].filter((f) => f.value)

  const includes = (t.raw('includesItems') as string[]).filter((_, i) => i !== 0 || training.certificate)

  return (
    <article className="flex flex-col pb-10">
      {/* Bandeau sombre */}
      <header className="bg-forge text-kaolin [--ink:#f5f2ec] [--line:rgba(255,255,255,0.14)] [--muted:rgba(245,242,236,0.65)] [--accent:var(--sable)]">
        <div className="container-site grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <div className="flex flex-col gap-6 lg:pb-10">
            <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/formations' }, { label: training.title }]} />
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl">{training.title}</h1>
            <p className="max-w-[60ch] text-lg leading-relaxed text-muted">{training.summary}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {facts.map(({ icon: Icon, value }) => (
                <li key={value} className="flex items-center gap-2">
                  <Icon className="size-4 text-sable" aria-hidden />
                  {value}
                </li>
              ))}
            </ul>
            {training.trainer && (
              <p className="flex items-center gap-3 text-sm">
                <span className="flex size-10 items-center justify-center rounded-full bg-sable font-semibold text-forge" aria-hidden>
                  {training.trainer
                    .split(/\s+/)
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
                <span>
                  <span className="text-muted">{t('trainer')} · </span>
                  {training.trainer}
                </span>
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        {/* Carte d'inscription : remonte sur le bandeau, reste visible au défilement */}
        <aside className="order-first -mt-6 lg:order-last lg:-mt-72">
          <div className="flex flex-col border border-line bg-surface shadow-[0_40px_80px_-40px_rgba(18,17,16,0.5)] lg:sticky lg:top-28">
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
              <MediaImage media={training.image} sizes="(min-width: 1024px) 24rem, 100vw" priority />
            </div>
            <div className="flex flex-col gap-5 p-6">
              <p className="font-display text-4xl leading-none">{price}</p>
              {nextDates && (
                <p className="flex items-start gap-3 bg-bg p-3 text-sm">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>
                    <span className="block text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">{t('nextSession')}</span>
                    {nextDates.end ? t('from', { start: nextDates.start, end: nextDates.end }) : t('on', { start: nextDates.start })}
                  </span>
                </p>
              )}
              <a
                href="#inscription"
                className="inline-flex min-h-14 items-center justify-center bg-accent px-6 text-xs font-semibold tracking-[0.2em] text-accent-ink uppercase transition-colors hover:bg-accent-hover"
              >
                {openSessions.length ? t('enrollNow') : t('waitingList')}
              </a>
              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <p className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">{t('includes')}</p>
                <ul className="flex flex-col gap-2 text-sm">
                  {includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col gap-16 py-4 lg:py-16">
          {/* Ce que vous apprendrez */}
          {program.length > 0 && (
            <Reveal as="section">
              <div className="flex flex-col gap-6 border border-line p-6 sm:p-8">
                <h2 className="font-display text-3xl">{t('learn')}</h2>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {program.map((module) => (
                    <li key={module.id} className="flex items-start gap-3 text-sm leading-relaxed">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                      {module.title}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {training.description && (
            <section aria-labelledby="presentation" className="flex flex-col gap-5">
              <h2 id="presentation" className="font-display text-3xl">
                {t('about')}
              </h2>
              <RichText data={training.description} className="text-lg" />
            </section>
          )}

          {/* Programme en accordéon */}
          {program.length > 0 && (
            <section aria-labelledby="programme" className="flex flex-col gap-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="programme" className="font-display text-3xl">
                  {t('program')}
                </h2>
                <span className="text-sm text-muted">
                  {t('modules', { count: program.length })} · {training.duration}
                </span>
              </div>
              <ol className="border-t border-line">
                {program.map((module, i) => (
                  <li key={module.id} className="border-b border-line">
                    <details className="group" open={i === 0}>
                      <summary className="flex cursor-pointer list-none items-center gap-5 py-5 [&::-webkit-details-marker]:hidden">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold text-accent tabular-nums transition-colors group-open:border-accent group-open:bg-accent group-open:text-accent-ink">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="flex-1 font-sans text-base font-semibold">{module.title}</h3>
                        <span className="text-xl text-muted transition-transform duration-500 ease-expo group-open:rotate-45" aria-hidden>
                          +
                        </span>
                      </summary>
                      {module.text && <p className="pb-6 pl-15 text-sm leading-relaxed text-muted">{module.text}</p>}
                    </details>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {training.trainer && (
            <section aria-labelledby="formateur" className="flex items-center gap-6 bg-surface p-6 sm:p-8">
              <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-forge font-display text-3xl text-kaolin" aria-hidden>
                <User className="size-8" />
              </span>
              <div className="flex flex-col gap-1">
                <h2 id="formateur" className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase [font-family:var(--font-sans)]">
                  {t('instructor')}
                </h2>
                <p className="font-display text-3xl">{training.trainer}</p>
                <p className="text-sm text-muted">{t('instructorText')}</p>
              </div>
            </section>
          )}

          {/* Inscription */}
          <section id="inscription" aria-labelledby="inscription-titre" className="flex scroll-mt-28 flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="eyebrow">{t('enroll')}</p>
              <h2 id="inscription-titre" className="font-display text-4xl">
                {requests('services.formation.title')}
              </h2>
            </div>
            {openSessions.length === 0 && <p className="border border-line bg-surface p-5 text-sm text-muted">{t('noSessions')}</p>}
            {openSessions.length > 0 && (
              <Suspense>
                <EnrollmentForm sessions={openSessions} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
              </Suspense>
            )}
          </section>
        </div>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: training.title,
          description: training.summary,
          url: absoluteUrl(locale, `/formations/${training.slug}`),
          provider: { '@id': `${siteUrl}/#entreprise` },
          ...(training.price ? { offers: { '@type': 'Offer', price: training.price, priceCurrency: 'GNF', category: 'Paid' } } : {}),
          hasCourseInstance: sessions.map((s) => ({
            '@type': 'CourseInstance',
            courseMode: 'onsite',
            startDate: s.startDate,
            endDate: s.endDate ?? undefined,
            location: s.location,
          })),
        }}
      />
    </article>
  )
}
