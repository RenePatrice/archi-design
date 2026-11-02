import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ColorConfigurator, type PaintColor } from '@/components/configurator/color-configurator'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { mediaPath } from '@/components/ui/media-image'
import type { Locale } from '@/i18n/routing'
import { getProducts } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Configurator' })
  return pageMetadata({ locale, path: '/configurateur', title: t('metaTitle'), description: t('metaDescription') })
}

/** Configurateur de couleurs : le nuancier est celui des peintures réellement vendues. */
export default async function ConfiguratorPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, products] = await Promise.all([getTranslations('Configurator'), getProducts(locale)])

  const colors: PaintColor[] = products
    .filter((p) => p.category === 'peinture' && p.colorHex)
    .map((p) => {
      const image = (p.images?.[0] && typeof p.images[0] === 'object' ? p.images[0] : null) as Media | null
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        reference: p.reference,
        hex: p.colorHex!,
        price: p.price,
        unit: p.unit,
        image: image?.url ? mediaPath(image.sizes?.thumbnail?.url ?? image.url) : null,
      }
    })

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <ColorConfigurator colors={colors} />
    </div>
  )
}
