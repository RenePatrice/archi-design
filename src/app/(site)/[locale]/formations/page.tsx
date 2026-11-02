import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ClientMessages } from '@/components/i18n/client-messages'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { CourseCatalog, type CourseSummary } from '@/components/training/course-catalog'
import { mediaPath } from '@/components/ui/media-image'
import { LineIcon } from '@/components/ui/ornaments'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getTrainings, getUpcomingSessions } from '@/lib/queries'
import { formatGNF } from '@/lib/requests/print-pricing'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { Media, Training } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Training' })
  return pageMetadata({ locale, path: '/formations', title: t('metaTitle'), description: t('metaDescription') })
}

/** Académie : bandeau, catalogue filtrable, calendrier des sessions en frise. */
export default async function TrainingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, trainings, sessions] = await Promise.all([getTranslations('Training'), getTrainings(locale), getUpcomingSessions(locale)])

  const tz = { timeZone: 'Africa/Conakry' } as const
  const short = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', ...tz })
  const courses: CourseSummary[] = trainings.map((training) => {
    const image = typeof training.image === 'object' ? (training.image as Media | null) : null
    const next = sessions.find((s) => s.status === 'ouverte' && (typeof s.training === 'object' ? s.training?.id : s.training) === training.id)
    return {
      id: training.id,
      slug: training.slug,
      title: training.title,
      summary: training.summary,
      level: training.level ?? 'tous',
      duration: training.duration,
      modules: training.program?.length ?? 0,
      certificate: Boolean(training.certificate),
      trainer: training.trainer ?? null,
      price: training.price ? formatGNF(training.price, locale) : t('onQuote'),
      nextSession: next ? t('nextOn', { date: short.format(new Date(next.startDate)) }) : null,
      image: image?.url ? mediaPath(image.sizes?.card?.url ?? image.url) : null,
      imageAlt: image?.alt ?? '',
    }
  })

  const maxSeats = Math.max(0, ...sessions.map((s) => s.seats ?? 0))
  const stats = [
    { icon: 'cert', value: String(trainings.length), label: t('stats.courses') },
    { icon: 'clock', value: String(sessions.length), label: t('stats.sessions') },
    ...(maxSeats ? [{ icon: 'users', value: `≤ ${maxSeats}`, label: t('stats.group') } as const] : []),
    { icon: 'shield', value: String(trainings.filter((x) => x.certificate).length), label: t('stats.certified') },
  ] as const

  const day = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', ...tz })
  const month = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric', ...tz })

  return (
    <div className="flex flex-col gap-20 pb-10">
      {/* Bandeau de l'académie */}
      <section className="relative isolate overflow-hidden bg-forge text-kaolin [--ink:#f5f2ec] [--line:rgba(255,255,255,0.14)] [--muted:rgba(245,242,236,0.65)] [--accent:var(--sable)]">
        <div className="dot-grid absolute inset-0 -z-10 opacity-30 [--ink:#f5f2ec]" aria-hidden />
        <div className="container-site flex flex-col gap-10 py-12 sm:py-16">
          <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-6">
              <p className="eyebrow">{t('eyebrow')}</p>
              <h1 className="font-display text-5xl leading-[1.02] sm:text-7xl">{t('title')}</h1>
              <p className="max-w-[55ch] text-lg leading-relaxed text-muted">{t('intro')}</p>
              <div className="flex flex-wrap gap-3">
                <a href="#catalogue" className="inline-flex min-h-14 items-center bg-sable px-8 text-xs font-semibold tracking-[0.2em] text-forge uppercase transition-colors hover:bg-kaolin">
                  {t('browse')}
                </a>
                <a href="#calendrier" className="inline-flex min-h-14 items-center border border-kaolin/40 px-8 text-xs font-semibold tracking-[0.2em] uppercase transition-colors hover:border-kaolin hover:bg-kaolin hover:text-forge">
                  {t('calendar')}
                </a>
              </div>
            </div>
            <dl className="grid grid-cols-2 border-t border-l border-line">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-3 border-r border-b border-line p-5">
                  <LineIcon name={s.icon} className="size-7 text-sable" />
                  <dd className="font-display text-4xl leading-none">{s.value}</dd>
                  <dt className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" aria-labelledby="catalogue-titre" className="container-site flex scroll-mt-28 flex-col gap-8">
        <h2 id="catalogue-titre" className="font-display text-4xl sm:text-5xl">
          {t('catalog')}
        </h2>
        <ClientMessages namespaces={['Training']}>
          <CourseCatalog courses={courses} />
        </ClientMessages>
      </section>

      {/* Calendrier en frise */}
      <section id="calendrier" aria-labelledby="calendrier-titre" className="container-site flex scroll-mt-28 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">{t('sessionsTitle')}</p>
          <h2 id="calendrier-titre" className="font-display text-4xl sm:text-5xl">
            {t('calendar')}
          </h2>
        </div>
        {sessions.length === 0 ? (
          <p className="border border-line bg-surface p-6 text-muted">{t('noSessions')}</p>
        ) : (
          <ol className="flex flex-col border-t border-line">
            {sessions.map((session, i) => {
              const training = typeof session.training === 'object' ? (session.training as Training) : null
              const full = session.status === 'complete'
              const start = new Date(session.startDate)
              return (
                <Reveal as="li" key={session.id} delay={Math.min(i, 6) * 60}>
                  <div className="group grid items-center gap-4 border-b border-line py-5 transition-colors hover:bg-surface sm:grid-cols-[6rem_1fr_auto] sm:gap-8 sm:px-4">
                    <time dateTime={session.startDate} className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0">
                      <span className="font-display text-5xl leading-none text-accent">{day.format(start)}</span>
                      <span className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">{month.format(start)}</span>
                    </time>
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-2xl">{training?.title}</span>
                      <span className="flex flex-wrap gap-x-3 text-sm text-muted">
                        <span>{session.location}</span>
                        {session.seats ? <span>· {t('seats', { count: session.seats })}</span> : null}
                        {training?.duration && <span>· {training.duration}</span>}
                      </span>
                    </div>
                    {full ? (
                      <span className="justify-self-start border border-line px-4 py-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-muted uppercase sm:justify-self-end">
                        {t('full')}
                      </span>
                    ) : (
                      training && (
                        <Link
                          href={`/formations/${training.slug}?session=${session.id}#inscription`}
                          className={cn(
                            'inline-flex min-h-12 items-center justify-self-start border border-ink px-6 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 sm:justify-self-end',
                            'hover:bg-ink hover:text-bg',
                          )}
                        >
                          {t('enroll')}
                        </Link>
                      )
                    )}
                  </div>
                </Reveal>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
