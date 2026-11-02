import config from '@payload-config'
import { Award, Clock, GraduationCap, User } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'
import { Suspense } from 'react'

import { EnrollmentForm } from '@/components/forms/enrollment-form'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { MediaImage } from '@/components/ui/media-image'
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

/** Fiche formation : programme, sessions, inscription en ligne. */
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

  const facts = [
    { icon: Clock, label: t('duration'), value: training.duration },
    { icon: GraduationCap, label: t('level'), value: t(`levels.${training.level ?? 'tous'}`) },
    { icon: User, label: t('trainer'), value: training.trainer },
    { icon: Award, label: t('certificate'), value: training.certificate ? '✓' : null },
  ].filter((f) => f.value)

  return (
    <article className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/formations' }, { label: training.title }]} />

      <header className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{training.title}</h1>
          <p className="max-w-[60ch] text-lg text-muted">{training.summary}</p>
          <p className="font-display text-2xl font-extrabold tabular-nums [font-stretch:112%]">
            {training.price ? formatGNF(training.price, locale) : t('onQuote')}
          </p>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-surface-sunken">
          <MediaImage media={training.image} sizes="(min-width: 1024px) 40vw, 100vw" priority />
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-4">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 bg-surface p-4">
            <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <div>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-10">
          <RichText data={training.description} className="text-lg" />
          {training.program && training.program.length > 0 && (
            <section aria-labelledby="programme" className="flex flex-col gap-4">
              <h2 id="programme" className="text-2xl font-bold">
                {t('program')}
              </h2>
              {/* Les modules s'enchaînent dans cet ordre : liste numérotée */}
              <ol className="flex flex-col divide-y divide-line border-y border-line">
                {training.program.map((module, i) => (
                  <li key={module.id} className="grid grid-cols-[2.5rem_1fr] gap-2 py-4">
                    <span className="font-mono text-sm text-accent tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="font-bold [font-family:var(--font-sans)] [font-stretch:100%]">{module.title}</h3>
                      {module.text && <p className="text-sm text-muted">{module.text}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <section id="inscription" aria-labelledby="inscription-titre" className="flex scroll-mt-24 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <h2 id="inscription-titre" className="text-2xl font-bold">
            {requests('services.formation.title')}
          </h2>
          {openSessions.length === 0 && <p className="rounded-md bg-surface-sunken p-4 text-sm text-muted">{t('noSessions')}</p>}
          {openSessions.length > 0 && (
            <Suspense>
              <EnrollmentForm sessions={openSessions} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
            </Suspense>
          )}
        </section>
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
