import { ArrowRight, ArrowUp } from 'lucide-react'
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

const headingClass = 'font-sans text-[0.625rem] font-semibold tracking-[0.28em] text-kaolin/50 uppercase'
const linkClass = 'text-kaolin/80 transition-colors hover:text-sable'

/** Pied de page sombre : appel à l'action, pôles, coordonnées, outils, pages légales et signature. */
export async function SiteFooter({ settings, poles, pages }: Props) {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')
  const print = await getTranslations('Print')
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-forge text-kaolin sm:mt-32">
      <div className="container-site flex flex-col gap-8 border-b border-kaolin/10 py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-5xl leading-none sm:text-7xl lg:text-8xl">{t('ctaTitle')}</h2>
          <p className="text-kaolin/60">{t('ctaText')}</p>
        </div>
        <Link
          href="/contact"
          className="group flex size-36 shrink-0 items-center justify-center rounded-full border border-kaolin/30 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:border-sable hover:bg-sable hover:text-forge sm:size-44"
        >
          <span className="flex items-center gap-2">
            {nav('contact')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      </div>
      <div className="container-site grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5 [&_.text-muted]:text-kaolin/50">
          <Wordmark />
          {settings.tagline && <p className="max-w-xs text-sm leading-relaxed text-kaolin/60">{settings.tagline}</p>}
        </div>

        <nav aria-labelledby="footer-poles" className="flex flex-col gap-5">
          <h2 id="footer-poles" className={headingClass}>
            {t('poles')}
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm">
            {poles.map((pole) => (
              <li key={pole.id}>
                <Link href={`/services/${pole.slug}`} className={linkClass}>
                  {pole.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-5">
          <h2 className={headingClass}>{t('contact')}</h2>
          <address className="flex flex-col gap-2.5 text-sm not-italic text-kaolin/80">
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
            {settings.openingHours && <span className="text-kaolin/50">{settings.openingHours}</span>}
          </address>
        </div>

        <nav aria-labelledby="footer-outils" className="flex flex-col gap-5">
          <h2 id="footer-outils" className={headingClass}>
            {t('tools')}
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm">
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
          <nav aria-labelledby="footer-legal" className="flex flex-col gap-5">
            <h2 id="footer-legal" className={headingClass}>
              {t('legal')}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
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
      <div className="border-t border-kaolin/10">
        <div className="container-site flex items-center justify-between gap-4 py-6 text-xs text-kaolin/50">
          <p>
            © {year} {settings.companyName}. {t('rights')}
          </p>
          <a href="#contenu" className="flex items-center gap-2 tracking-[0.2em] uppercase transition-colors hover:text-sable">
            {t('backToTop')}
            <ArrowUp className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  )
}
