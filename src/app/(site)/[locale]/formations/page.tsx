import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { Badge } from '@/components/ui/card'
import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatSessionDates } from '@/lib/dates'
import { getTrainings, getUpcomingSessions } from '@/lib/queries'
import { formatGNF } from '@/lib/requests/print-pricing'
import { pageMetadata } from '@/lib/seo'
import type { Training } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Training' })
  return pageMetadata({ locale, path: '/formations', title: t('metaTitle'), description: t('metaDescription') })
}

/** Catalogue des formations et calendrier des prochaines sessions. */
export default async function TrainingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, trainings, sessions] = await Promise.all([getTranslations('Training'), getTrainings(locale), getUpcomingSessions(locale)])

  return (
    <div className="container-site flex flex-col gap-14 py-10 sm:py-14">
      <div className="flex flex-col gap-10">
        <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
        <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      </div>

      <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => (
          <li key={training.id} className="group relative flex flex-col gap-3">
            <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-surface-sunken">
              <MediaImage media={training.image} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="creative">{t(`levels.${training.level ?? 'tous'}`)}</Badge>
              <Badge>{training.duration}</Badge>
            </div>
            <h2 className="text-xl font-bold">
              <Link href={`/formations/${training.slug}`} className="after:absolute after:inset-0 hover:text-accent">
                {training.title}
              </Link>
            </h2>
            <p className="text-sm text-muted">{training.summary}</p>
            <p className="mt-auto font-semibold tabular-nums">{training.price ? formatGNF(training.price, locale) : t('onQuote')}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="calendrier" className="flex flex-col gap-6">
        <h2 id="calendrier" className="flex items-center gap-3 text-3xl font-extrabold">
          <CalendarDays className="size-8 text-accent" aria-hidden />
          {t('calendar')}
        </h2>
        {sessions.length === 0 ? (
          <p className="text-muted">{t('noSessions')}</p>
        ) : (
          <ol className="flex flex-col divide-y divide-line border-y border-line">
            {sessions.map((session) => {
              const training = typeof session.training === 'object' ? (session.training as Training) : null
              const dates = formatSessionDates(locale, session.startDate, session.endDate)
              const full = session.status === 'complete'
              return (
                <li key={session.id} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-6">
                  <time dateTime={session.startDate} className="font-mono text-sm text-accent">
                    {dates.start}
                  </time>
                  <div className="flex flex-col">
                    <span className="font-semibold">{training?.title}</span>
                    <span className="text-sm text-muted">
                      {dates.end ? t('from', { start: dates.start, end: dates.end }) : t('on', { start: dates.start })} · {session.location}
                    </span>
                  </div>
                  {full ? (
                    <Badge>{t('full')}</Badge>
                  ) : (
                    training && (
                      <Link
                        href={`/formations/${training.slug}?session=${session.id}#inscription`}
                        className="inline-flex min-h-11 items-center font-semibold text-accent hover:underline"
                      >
                        {t('enroll')}
                      </Link>
                    )
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
