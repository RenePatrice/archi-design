'use client'

import { ShoppingBag } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { useCart } from './cart'

/** Icône du panier dans l'en-tête, avec le nombre d'articles. */
export function CartButton() {
  const t = useTranslations('Shop')
  const { count, ready } = useCart()

  return (
    <Link href="/boutique/panier" aria-label={t('cartCount', { count })} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}>
      <ShoppingBag aria-hidden />
      {ready && count > 0 && (
        <span className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[0.6875rem] leading-5 text-accent-ink tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
