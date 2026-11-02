'use client'

import { Check, Plus } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { formatGNF } from '@/lib/requests/print-pricing'
import { cn } from '@/lib/utils'

import { useCart } from './cart'

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
  /** Deuxième photo, affichée au survol */
  imageHover?: string | null
  imageAlt: string
  colorHex?: string | null
}

type Sort = 'featured' | 'priceAsc' | 'priceDesc' | 'name'

/** Carte produit façon boutique en ligne : photo, ajout rapide au survol, badges, prix. */
export function ProductCard({ product, priority }: { product: CatalogProduct; priority?: boolean }) {
  const t = useTranslations('Shop')
  const locale = useLocale()
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const quickAdd = () => {
    add({ id: product.id, slug: product.slug, name: product.name, reference: product.reference, price: product.price, unit: product.unit, image: product.image }, 1)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden bg-surface-sunken">
        {product.image && (
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
            className={cn(
              'object-cover transition-[transform,opacity] duration-700 ease-expo group-hover:scale-[1.06]',
              product.imageHover && 'group-hover:opacity-0',
            )}
          />
        )}
        {product.imageHover && (
          <Image
            src={product.imageHover}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
            className="scale-[1.06] object-cover opacity-0 transition-[transform,opacity] duration-700 ease-expo group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {/* Badges */}
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <span className="bg-bg/90 px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
            {t(`categories.${product.category as 'peinture'}`)}
          </span>
          {!product.inStock && (
            <span className="bg-forge px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.18em] text-kaolin uppercase">{t('onOrder')}</span>
          )}
        </span>
        {product.colorHex && (
          <span
            className="absolute top-3 right-3 size-7 rounded-full border-2 border-white shadow-md ring-1 ring-black/5"
            style={{ backgroundColor: product.colorHex }}
            aria-hidden
          />
        )}
        {/* Ajout rapide : glisse depuis le bas au survol, toujours visible au toucher */}
        <button
          type="button"
          onClick={quickAdd}
          aria-label={t('quickAdd', { name: product.name })}
          className={cn(
            'absolute inset-x-3 bottom-3 z-10 flex min-h-11 items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase transition-all duration-500 ease-expo',
            'translate-y-0 opacity-100 [@media(hover:hover)]:translate-y-[120%] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:translate-y-0 [@media(hover:hover)]:focus-visible:opacity-100',
            added ? 'bg-success text-white' : 'bg-forge text-kaolin hover:bg-accent',
          )}
        >
          {added ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {added ? t('added') : t('add')}
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[0.625rem] tracking-[0.14em] text-muted uppercase">{product.reference}</p>
        <h3 className="font-sans text-[0.9375rem] leading-snug font-semibold">
          <Link href={`/boutique/${product.slug}`} className="transition-colors after:absolute after:inset-0 after:bottom-auto after:aspect-square hover:text-accent">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-display text-2xl leading-none tabular-nums">{formatGNF(product.price, locale)}</span>
          <span className="text-xs text-muted">{t('per', { unit: product.unit })}</span>
        </p>
        <p className={cn('flex items-center gap-1.5 text-xs font-medium', product.inStock ? 'text-success' : 'text-muted')}>
          <span className={cn('size-1.5 rounded-full', product.inStock ? 'bg-success' : 'bg-muted')} aria-hidden />
          {product.inStock ? t('inStock') : t('onOrder')}
        </p>
      </div>
    </article>
  )
}

/** Catalogue : filtre par catégorie (gardé dans l'adresse : ?categorie=peinture), tri, grille de cartes. */
export function ProductCatalog({ products, categories }: { products: CatalogProduct[]; categories: string[] }) {
  const t = useTranslations('Shop')
  const searchParams = useSearchParams()
  const current = searchParams.get('categorie') ?? ''
  const [sort, setSort] = useState<Sort>('featured')

  const visible = (current ? products.filter((p) => p.category === current) : products).slice().sort((a, b) => {
    if (sort === 'priceAsc') return a.price - b.price
    if (sort === 'priceDesc') return b.price - a.price
    if (sort === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  // Filtrage dans le navigateur : l'adresse est mise à jour sans recharger la page
  const select = (category: string) =>
    window.history.replaceState(null, '', category ? `${window.location.pathname}?categorie=${category}` : window.location.pathname)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t('all')} className="flex flex-wrap gap-2">
          {['', ...categories].map((category) => {
            const count = category ? products.filter((p) => p.category === category).length : products.length
            return (
              <button
                key={category || 'tous'}
                type="button"
                aria-pressed={current === category}
                onClick={() => select(category)}
                className={cn(
                  'flex min-h-11 items-center gap-2 border px-4 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-300',
                  current === category ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink/50',
                )}
              >
                {category ? t(`categories.${category as 'peinture'}`) : t('all')}
                <span className={cn('tabular-nums', current === category ? 'text-bg/60' : 'text-muted')}>{count}</span>
              </button>
            )
          })}
        </div>
        <label className="flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted uppercase">
          {t('sort.label')}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="select-ui min-h-11 cursor-pointer appearance-none border border-line bg-surface py-2 pr-10 pl-3 text-sm font-medium tracking-normal text-ink normal-case"
          >
            {(['featured', 'priceAsc', 'priceDesc', 'name'] as const).map((s) => (
              <option key={s} value={s}>
                {t(`sort.${s}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((product, i) => (
          <li key={product.id} className="fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
            <ProductCard product={product} priority={i < 4} />
          </li>
        ))}
      </ul>
    </div>
  )
}
