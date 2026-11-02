import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

import { ContactForm } from '@/components/forms/contact-form'
import { OsmMap } from '@/components/forms/osm-map'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { buttonVariants } from '@/components/ui/button'
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

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="formulaire" className="flex flex-col gap-6">
          <h2 id="formulaire" className="text-2xl font-bold">
            {t('formTitle')}
          </h2>
          <Suspense>
            <ContactForm poles={poleOptions} whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacy?.slug ?? null} />
          </Suspense>
        </section>

        <aside className="flex flex-col gap-8">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
              <MessageCircle aria-hidden />
              {whatsappLabels('button')}
            </a>
          )}

          <section aria-labelledby="coordonnees" className="flex flex-col gap-4">
            <h2 id="coordonnees" className="text-2xl font-bold">
              {t('details')}
            </h2>
            <dl className="flex flex-col gap-4">
              {settings.address && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <dt className="text-sm text-muted">{t('address')}</dt>
                    <dd className="whitespace-pre-line">{settings.address}</dd>
                  </div>
                </div>
              )}
              {settings.phone && (
                <div className="flex gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <dt className="text-sm text-muted">{t('phone')}</dt>
                    <dd>
                      <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="underline-offset-4 hover:underline">
                        {settings.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {settings.email && (
                <div className="flex gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <dt className="text-sm text-muted">{t('email')}</dt>
                    <dd>
                      <a href={`mailto:${settings.email}`} className="underline-offset-4 hover:underline">
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {settings.openingHours && (
                <div className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <dt className="text-sm text-muted">{t('hours')}</dt>
                    <dd>{settings.openingHours}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>

          {settings.latitude != null && settings.longitude != null && (
            <section aria-labelledby="plan" className="flex flex-col gap-3">
              <h2 id="plan" className="text-2xl font-bold">
                {t('map')}
              </h2>
              <OsmMap latitude={settings.latitude} longitude={settings.longitude} label={t('map')} />
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
