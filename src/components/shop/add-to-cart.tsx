'use client'

import { Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import { useCart, type CartItem } from './cart'

/** Sélecteur de quantité + bouton « Ajouter au panier », avec confirmation visible. */
export function AddToCart({ product }: { product: Omit<CartItem, 'quantity'> }) {
  const t = useTranslations('Shop')
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityInput value={quantity} onChange={setQuantity} id={`qte-${product.id}`} />
        <Button
          size="lg"
          className={added ? 'flex-1 bg-success hover:bg-success' : 'flex-1'}
          onClick={() => {
            add(product, quantity)
            setAdded(true)
          }}
        >
          {added ? <Check aria-hidden /> : <ShoppingBag aria-hidden />}
          {added ? t('added') : t('addToCart')}
        </Button>
      </div>
      <p aria-live="polite" className="min-h-6">
        {added && (
          <Link href="/boutique/panier" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('viewCart')}
          </Link>
        )}
      </p>
    </div>
  )
}

/** Champ quantité avec boutons − et + assez grands pour le doigt. */
export function QuantityInput({ value, onChange, id, label }: { value: number; onChange: (n: number) => void; id: string; label?: string }) {
  const t = useTranslations('Shop')
  return (
    <div className="flex min-h-14 items-center border border-line bg-surface">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={t('decrease')}
        className="flex size-12 items-center justify-center transition-colors hover:bg-surface-sunken"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <label htmlFor={id} className="sr-only">
        {label ?? t('quantity')}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={9999}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
        className="h-12 w-14 border-x border-line bg-transparent text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(9999, value + 1))}
        aria-label={t('increase')}
        className="flex size-12 items-center justify-center transition-colors hover:bg-surface-sunken"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
