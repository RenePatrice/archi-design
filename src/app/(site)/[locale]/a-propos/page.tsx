import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MediaImage } from '@/components/ui/media-image'
import type { Locale } from '@/i18n/routing'
import { getAboutPage, getTeam } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  return pageMetadata({ locale, path: '/a-propos', title: t('metaTitle'), description: t('metaDescription') })
}

/** Page « À propos » : contenu entièrement modifiable dans le back-office (global « Page À propos »). */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, about, team] = await Promise.all([getTranslations('About'), getAboutPage(locale), getTeam(locale)])

  return (
    <div className="flex flex-col">
      <header className="container-site flex flex-col gap-6 py-10 sm:py-14">
        <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
        <p className="eyebrow">{t('eyebrow')}</p>
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{t('title')}</h1>
        {about.intro && <p className="max-w-[62ch] text-lg text-muted">{about.intro}</p>}
      </header>

      {(about.vision || about.mission) && (
        <section className="bg-fouta text-kaolin">
          <dl className="container-site grid gap-10 py-14 md:grid-cols-2">
            {about.vision && (
              <div className="flex flex-col gap-3">
                <dt className="font-mono text-xs tracking-[0.12em] text-kaolin/70 uppercase">{t('vision')}</dt>
                <dd className="font-display text-2xl leading-snug font-bold [font-stretch:108%]">{about.vision}</dd>
              </div>
            )}
            {about.mission && (
              <div className="flex flex-col gap-3">
                <dt className="font-mono text-xs tracking-[0.12em] text-kaolin/70 uppercase">{t('mission')}</dt>
                <dd className="text-lg leading-relaxed text-kaolin/90">{about.mission}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {about.values && about.values.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-16" aria-labelledby="valeurs">
          <h2 id="valeurs" className="text-3xl font-extrabold">
            {t('values')}
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value) => (
              <li key={value.id} className="flex flex-col gap-2 bg-surface p-5">
                <h3 className="text-lg font-bold">{value.title}</h3>
                {value.text && <p className="text-sm text-muted">{value.text}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {about.history && about.history.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-10" aria-labelledby="histoire">
          <h2 id="histoire" className="text-3xl font-extrabold">
            {t('history')}
          </h2>
          {/* Frise chronologique : l'ordre est une information, d'où la liste ordonnée */}
          <ol className="flex flex-col border-l-2 border-line">
            {about.history.map((step) => (
              <li key={step.id} className="relative flex flex-col gap-1 pb-8 pl-6 last:pb-0">
                <span className="absolute top-1.5 -left-[7px] size-3 rounded-full bg-accent" aria-hidden />
                <span className="font-mono text-sm text-accent">{step.year}</span>
                <h3 className="text-lg font-bold">{step.title}</h3>
                {step.text && <p className="max-w-[60ch] text-muted">{step.text}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {team.length > 0 && (
        <section className="container-site flex flex-col gap-8 py-16" aria-labelledby="equipe">
          <h2 id="equipe" className="text-3xl font-extrabold">
            {t('team')}
          </h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {team.map((member) => (
              <li key={member.id} className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
                  {member.photo ? (
                    <MediaImage media={member.photo} sizes="(min-width: 1024px) 25vw, 50vw" />
                  ) : (
                    // Sans photo : initiales sur fond de la charte
                    <span className="absolute inset-0 flex items-center justify-center font-display text-4xl font-extrabold text-muted [font-stretch:118%]">
                      {member.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-bold [font-family:var(--font-sans)] [font-stretch:100%]">{member.name}</h3>
                  <p className="text-sm text-muted">{member.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {about.commitments && about.commitments.length > 0 && (
        <section className="border-t border-line bg-surface" aria-labelledby="engagements">
          <div className="container-site flex flex-col gap-8 py-16">
            <h2 id="engagements" className="text-3xl font-extrabold">
              {t('commitments')}
            </h2>
            <ul className="grid gap-8 md:grid-cols-2">
              {about.commitments.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 border-l-4 border-deep pl-5">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  {item.text && <p className="text-muted">{item.text}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
