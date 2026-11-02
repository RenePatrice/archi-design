import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { AddToCart } from '@/components/shop/add-to-cart'
import { ProductCard, type CatalogProduct } from '@/components/shop/product-catalog'
import { ProductGallery } from '@/components/shop/product-gallery'
import { TrustBar } from '@/components/shop/trust-bar'
import { Reveal } from '@/components/ui/reveal'
import { Link } from '@/i18n/navigation'
import { mediaPath } from '@/components/ui/media-image'
import { RichText } from '@/components/ui/rich-text'
import { routing, type Locale } from '@/i18n/routing'
import { getProductBySlug, getProducts } from '@/lib/queries'
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
  const [t, configurator, all] = await Promise.all([getTranslations('Shop'), getTranslations('Configurator'), getProducts(locale)])

  // Produits associés : même catégorie d'abord, puis le reste du catalogue
  const toCard = (p: (typeof all)[number]): CatalogProduct => {
    const img = (p.images?.[0] && typeof p.images[0] === 'object' ? p.images[0] : null) as Media | null
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      reference: p.reference,
      category: p.category,
      price: p.price,
      unit: p.unit,
      inStock: (p.stock ?? 0) > 0,
      image: img?.url ? mediaPath(img.sizes?.card?.url ?? img.url) : null,
      imageAlt: img?.alt ?? '',
      colorHex: p.colorHex,
    }
  }
  const related = [...all.filter((p) => p.id !== product.id && p.category === product.category), ...all.filter((p) => p.id !== product.id && p.category !== product.category)]
    .slice(0, 4)
    .map(toCard)

  const images = (product.images ?? []).filter((m): m is Media => typeof m === 'object' && m !== null)
  const inStock = (product.stock ?? 0) > 0
  const cover = images[0]

  return (
    <article className="container-site flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/boutique' }, { label: product.name }]} />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery
            images={images.filter((m) => m.url).map((m) => ({ url: mediaPath(m.url!), alt: m.alt }))}
            labels={images.map((_, i) => t('photo', { n: i + 1 }))}
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="eyebrow">{t(`categories.${product.category}`)}</p>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="tracking-[0.12em] uppercase">{t('reference', { reference: product.reference })}</span>
            <span className={inStock ? 'flex items-center gap-2 font-medium text-success' : 'flex items-center gap-2'}>
              <span className={inStock ? 'pulse-ring size-2 rounded-full bg-success text-success' : 'size-2 rounded-full bg-muted'} aria-hidden />
              {inStock ? t('inStock') : t('onOrder')}
            </span>
          </p>

          <p className="flex flex-wrap items-baseline gap-x-2 border-y border-line py-6">
            <span className="sr-only">{t('price')}</span>
            <span className="font-display text-5xl leading-none tabular-nums">{formatGNF(product.price, locale)}</span>
            <span className="text-muted">{t('per', { unit: product.unit })}</span>
          </p>

          {product.summary && <p className="text-lg leading-relaxed text-muted">{product.summary}</p>}

          {product.colorHex && (
            <div className="flex items-center gap-4 bg-surface p-4">
              <span className="size-12 shrink-0 rounded-full border-4 border-bg shadow-md ring-1 ring-line" style={{ backgroundColor: product.colorHex }} aria-hidden />
              <span className="flex flex-col">
                <span className="text-sm">
                  {t('color')} <span className="font-mono">{product.colorHex.toUpperCase()}</span>
                </span>
                <Link href="/configurateur" className="text-xs font-semibold tracking-[0.14em] text-accent uppercase underline-offset-4 hover:underline">
                  {configurator('metaTitle')} →
                </Link>
              </span>
            </div>
          )}

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
          <TrustBar compact />

          {product.technicalSheet && (
            <details className="group border-b border-line" open>
              <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-display text-2xl [&::-webkit-details-marker]:hidden">
                <h2 id="fiche-produit">{t('technicalSheet')}</h2>
                <span className="text-2xl text-accent transition-transform duration-500 ease-expo group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <div className="pb-6">
                <RichText data={product.technicalSheet} />
              </div>
            </details>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="associes" className="flex flex-col gap-8 border-t border-line pt-16">
          <h2 id="associes" className="font-display text-4xl">
            {t('related')}
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

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
