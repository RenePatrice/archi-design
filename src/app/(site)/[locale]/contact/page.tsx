import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

import { ContactForm } from '@/components/forms/contact-form'
import { OsmMap } from '@/components/forms/osm-map'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { CompassMark } from '@/components/ui/ornaments'
import type { Locale } from '@/i18n/routing'
import { getFooterPages, getPoles } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Contact' })
  return pageMetadata({ locale, path: '/contact', title: t('metaTitle'), description: t('metaDescription') })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, whatsappLabels, settings, poles, pages] = await Promise.all([
    getTranslations('Contact'),
    getTranslations('WhatsApp'),
    getSiteSettings(locale),
    getPoles(locale),
    getFooterPages(locale),
  ])

  const whatsapp = buildWhatsAppLink(settings.whatsappNumber, whatsappLabels('defaultMessage'))
  const privacy = pages.find((p) => p.slug.includes('confidentialite')) ?? null
  const poleOptions = poles.map((p) => ({ key: p.key, label: p.title }))

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />

      <div className="grid overflow-hidden border border-line lg:grid-cols-[1fr_1.45fr]">
        {/* Panneau sombre : coordonnées, WhatsApp, horaires */}
        <aside className="relative isolate flex flex-col gap-10 bg-forge p-8 text-kaolin sm:p-12 [--accent:var(--sable)] [--muted:rgba(245,242,236,0.6)]">
          <CompassMark className="spin-slow pointer-events-none absolute -right-16 -bottom-16 -z-10 size-72 text-kaolin/10 [animation-duration:90s]" />
          <section aria-labelledby="coordonnees" className="flex flex-col gap-8">
            <h2 id="coordonnees" className="font-display text-4xl">
              {t('details')}
            </h2>
            <dl className="flex flex-col gap-6">
              {(
                [
                  [MapPin, t('address'), settings.address ? <span className="whitespace-pre-line">{settings.address}</span> : null],
                  [
                    Phone,
                    t('phone'),
                    settings.phone ? (
                      <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-sable">
                        {settings.phone}
                      </a>
                    ) : null,
                  ],
                  [
                    Mail,
                    t('email'),
                    settings.email ? (
                      <a href={`mailto:${settings.email}`} className="transition-colors hover:text-sable">
                        {settings.email}
                      </a>
                    ) : null,
                  ],
                  [Clock, t('hours'), settings.openingHours || null],
                ] as const
              ).map(([Icon, label, value]) =>
                value ? (
                  <div key={label} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-kaolin/20 text-sable">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-[0.625rem] font-semibold tracking-[0.22em] text-muted uppercase">{label}</dt>
                      <dd className="text-lg">{value}</dd>
                    </div>
                  </div>
                ) : null,
              )}
            </dl>
          </section>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: 'lg', className: 'mt-auto bg-[#25D366] text-forge hover:bg-[#1fb757]' })}
            >
              <MessageCircle aria-hidden />
              {whatsappLabels('button')}
            </a>
          )}
        </aside>

        {/* Formulaire */}
        <section aria-labelledby="formulaire" className="flex flex-col gap-8 bg-surface p-6 sm:p-12">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">{t('eyebrow')}</p>
            <h2 id="formulaire" className="font-display text-4xl">
              {t('formTitle')}
            </h2>
          </div>
          <Suspense>
            <ContactForm poles={poleOptions} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacy?.slug ?? null} />
          </Suspense>
        </section>
      </div>

      {settings.latitude != null && settings.longitude != null && (
        <section aria-labelledby="plan" className="flex flex-col gap-5">
          <h2 id="plan" className="font-display text-3xl">
            {t('map')}
          </h2>
          <OsmMap latitude={settings.latitude} longitude={settings.longitude} label={t('map')} />
        </section>
      )}
    </div>
  )
}
