import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { SectionHeading } from '@/components/sections/section-heading'
import { mediaPath } from '@/components/ui/media-image'
import { ProductCatalog, type CatalogProduct } from '@/components/shop/product-catalog'
import { PRODUCT_CATEGORIES } from '@/collections/Products'
import type { Locale } from '@/i18n/routing'
import { getProducts } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Shop' })
  return pageMetadata({ locale, path: '/boutique', title: t('metaTitle'), description: t('metaDescription') })
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, products] = await Promise.all([getTranslations('Shop'), getProducts(locale)])

  const catalog: CatalogProduct[] = products.map((p) => {
    const image = (p.images?.[0] && typeof p.images[0] === 'object' ? p.images[0] : null) as Media | null
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      reference: p.reference,
      category: p.category,
      price: p.price,
      unit: p.unit,
      inStock: (p.stock ?? 0) > 0,
      image: image?.url ? mediaPath(image.sizes?.card?.url ?? image.url) : null,
      imageAlt: image?.alt ?? '',
      colorHex: p.colorHex,
    }
  })
  const categories = PRODUCT_CATEGORIES.filter((c) => catalog.some((p) => p.category === c))

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
      <SectionHeading as="h1" eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} />
      <Suspense>
        <ProductCatalog products={catalog} categories={[...categories]} />
      </Suspense>
    </div>
  )
}
