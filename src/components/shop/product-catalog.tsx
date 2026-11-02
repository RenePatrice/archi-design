'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { Link } from '@/i18n/navigation'
import { formatGNF } from '@/lib/requests/print-pricing'
import { cn } from '@/lib/utils'

export type CatalogProduct = {
  id: number
  slug: string
  name: string
  reference: string
  category: string
  price: number
  unit: string
  inStock: boolean
  image: string | null
  imageAlt: string
  colorHex?: string | null
}

/** Catalogue avec filtre par catégorie (gardé dans l'adresse : ?categorie=peinture). */
export function ProductCatalog({ products, categories }: { products: CatalogProduct[]; categories: string[] }) {
  const t = useTranslations('Shop')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const current = searchParams.get('categorie') ?? ''
  const visible = current ? products.filter((p) => p.category === current) : products

  // Filtrage dans le navigateur : l'adresse est mise à jour sans recharger la page
  const select = (category: string) =>
    window.history.replaceState(null, '', category ? `${window.location.pathname}?categorie=${category}` : window.location.pathname)

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label={t('all')} className="flex flex-wrap gap-2">
        {['', ...categories].map((category) => (
          <button
            key={category || 'tous'}
            type="button"
            aria-pressed={current === category}
            onClick={() => select(category)}
            className={cn(
              'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
              current === category ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:border-ink/50',
            )}
          >
            {category ? t(`categories.${category as 'peinture'}`) : t('all')}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((product) => (
          <li key={product.id} className="group relative flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              {product.colorHex && (
                <span
                  className="absolute right-2 bottom-2 size-7 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: product.colorHex }}
                  aria-hidden
                />
              )}
            </div>
            <p className="font-mono text-xs text-muted">{product.reference}</p>
            <h2 className="text-base leading-snug font-bold [font-family:var(--font-sans)] [font-stretch:100%]">
              <Link href={`/boutique/${product.slug}`} className="after:absolute after:inset-0 hover:text-accent">
                {product.name}
              </Link>
            </h2>
            <p className="mt-auto flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-semibold tabular-nums">{formatGNF(product.price, locale)}</span>
              <span className="text-xs text-muted">{t('per', { unit: product.unit })}</span>
            </p>
            <p className={cn('text-xs font-medium', product.inStock ? 'text-success' : 'text-muted')}>
              {product.inStock ? t('inStock') : t('onOrder')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
