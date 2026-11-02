import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { SiteSettingsData } from '@/lib/site-settings'
import type { Page, Pole } from '@/payload-types'

import { Wordmark } from './wordmark'

type Props = {
  settings: SiteSettingsData
  poles: Pick<Pole, 'id' | 'title' | 'slug'>[]
  pages: Pick<Page, 'id' | 'title' | 'slug'>[]
}

const headingClass = 'font-mono text-xs tracking-[0.12em] text-kaolin/70 uppercase [font-stretch:100%]'
const linkClass = 'underline-offset-4 hover:underline'

/** Pied de page en vert Fouta : pôles, coordonnées, pages légales et signature. */
export async function SiteFooter({ settings, poles, pages }: Props) {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')
  const print = await getTranslations('Print')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-fouta text-kaolin">
      <div className="frise-leppi" aria-hidden />
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4 [&_.text-muted]:text-kaolin/70">
          <Wordmark />
          {settings.tagline && <p className="max-w-sm text-kaolin/85">{settings.tagline}</p>}
        </div>

        <nav aria-labelledby="footer-poles" className="flex flex-col gap-3">
          <h2 id="footer-poles" className={headingClass}>
            {t('poles')}
          </h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {poles.map((pole) => (
              <li key={pole.id}>
                <Link href={`/services/${pole.slug}`} className={linkClass}>
                  {pole.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className={headingClass}>{t('contact')}</h2>
          <address className="flex flex-col gap-1.5 text-sm not-italic">
            {settings.address && <span className="whitespace-pre-line">{settings.address}</span>}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className={linkClass}>
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className={linkClass}>
                {settings.email}
              </a>
            )}
            {settings.openingHours && <span className="text-kaolin/70">{settings.openingHours}</span>}
          </address>
        </div>

        <nav aria-labelledby="footer-outils" className="flex flex-col gap-3">
          <h2 id="footer-outils" className={headingClass}>
            {t('tools')}
          </h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {(
              [
                ['/devis', nav('quote')],
                ['/simulateur', nav('simulator')],
                ['/configurateur', nav('configurator')],
                ['/impression', print('metaTitle')],
                ['/realisations/carte', nav('map')],
                ['/impact', nav('impact')],
              ] as const
            ).map(([href, label]) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {pages.length > 0 && (
          <nav aria-labelledby="footer-legal" className="flex flex-col gap-3">
            <h2 id="footer-legal" className={headingClass}>
              {t('legal')}
            </h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className={linkClass}>
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="border-t border-kaolin/15">
        <p className="container-site py-5 text-xs text-kaolin/70">
          © {year} {settings.companyName}. {t('rights')}
        </p>
      </div>
    </footer>
  )
}
