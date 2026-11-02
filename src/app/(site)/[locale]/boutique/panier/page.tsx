import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Checkout } from '@/components/shop/checkout'
import type { Locale } from '@/i18n/routing'
import { getPrivacySlug } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Shop' })
  return pageMetadata({ locale, path: '/boutique/panier', title: t('cart'), noIndex: true })
}

/** Panier et validation de la commande. Le contenu du panier vit dans le navigateur. */
export default async function CartPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, settings, privacySlug] = await Promise.all([getTranslations('Shop'), getSiteSettings(locale), getPrivacySlug(locale)])

  return (
    <div className="container-site flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/boutique' }, { label: t('cart') }]} />
      <h1 className="text-4xl font-extrabold">{t('cart')}</h1>
      <div className="max-w-3xl">
        <Checkout whatsappNumber={settings.whatsappNumber ?? null} privacySlug={privacySlug} />
      </div>
    </div>
  )
}
