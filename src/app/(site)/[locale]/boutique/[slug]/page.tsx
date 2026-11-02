import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { AddToCart } from '@/components/shop/add-to-cart'
import { Badge } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { MediaImage, mediaPath } from '@/components/ui/media-image'
import { RichText } from '@/components/ui/rich-text'
import { routing, type Locale } from '@/i18n/routing'
import { getProductBySlug } from '@/lib/queries'
import { formatGNF } from '@/lib/requests/print-pricing'
import { absoluteUrl, pageMetadata, siteUrl } from '@/lib/seo'
import type { Media } from '@/payload-types'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'products', limit: 1000, depth: 0, overrideAccess: false, select: { slug: true } })
  return routing.locales.flatMap((locale) => docs.map((d) => ({ locale, slug: d.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(locale, slug)
  if (!product) return {}
  const image = product.images?.[0] && typeof product.images[0] === 'object' ? (product.images[0] as Media) : null
  return pageMetadata({ locale, path: `/boutique/${slug}`, title: product.name, description: product.summary ?? undefined, image: image?.url })
}

/** Fiche produit : prix indicatif, stock, fiche technique, ajout au panier. */
export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const product = await getProductBySlug(locale, slug)
  if (!product) notFound()
  const [t, configurator] = await Promise.all([getTranslations('Shop'), getTranslations('Configurator')])

  const images = (product.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)
  const inStock = (product.stock ?? 0) > 0
  const cover = images[0]

  return (
    <article className="container-site flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/boutique' }, { label: product.name }]} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
            <MediaImage media={cover} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
          {images.length > 1 && (
            <ul className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((image) => (
                <li key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
                  <MediaImage media={image} sizes="12vw" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{t(`categories.${product.category}`)}</Badge>
            <Badge tone={inStock ? 'deep' : 'neutral'}>{inStock ? t('inStock') : t('onOrder')}</Badge>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <p className="font-mono text-sm text-muted">{t('reference', { reference: product.reference })}</p>
          {product.summary && <p className="text-lg text-muted">{product.summary}</p>}

          {product.colorHex && (
            <Link href="/configurateur" className="text-sm font-semibold text-accent underline underline-offset-4">
              {configurator('metaTitle')}
            </Link>
          )}
          {product.colorHex && (
            <p className="flex items-center gap-3">
              <span className="size-10 rounded-md border border-line" style={{ backgroundColor: product.colorHex }} aria-hidden />
              <span className="text-sm">
                {t('color')} <span className="font-mono">{product.colorHex.toUpperCase()}</span>
              </span>
            </p>
          )}

          <p className="flex flex-col gap-0.5 border-y border-line py-4">
            <span className="text-sm text-muted">{t('price')}</span>
            <span className="font-display text-3xl font-extrabold tabular-nums [font-stretch:112%]">
              {formatGNF(product.price, locale)} <span className="text-base font-normal text-muted">{t('per', { unit: product.unit })}</span>
            </span>
          </p>

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              reference: product.reference,
              price: product.price,
              unit: product.unit,
              image: cover?.url ? mediaPath(cover.sizes?.thumbnail?.url ?? cover.url) : null,
            }}
          />
          <p className="text-sm text-muted">{t('noPayment')}</p>

          {product.technicalSheet && (
            <section aria-labelledby="fiche-produit" className="flex flex-col gap-3 pt-4">
              <h2 id="fiche-produit" className="text-xl font-bold">
                {t('technicalSheet')}
              </h2>
              <RichText data={product.technicalSheet} />
            </section>
          )}
        </div>
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.reference,
          description: product.summary,
          image: cover?.url ? `${siteUrl}${mediaPath(cover.url)}` : undefined,
          url: absoluteUrl(locale, `/boutique/${product.slug}`),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'GNF',
            price: product.price,
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
            seller: { '@id': `${siteUrl}/#entreprise` },
          },
        }}
      />
    </article>
  )
}
