'use client'

import { ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'

import { RequestForm } from '@/components/forms/request-form'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { formatGNF } from '@/lib/requests/print-pricing'

import { QuantityInput } from './add-to-cart'
import { useCart } from './cart'

/** Page panier : modification des quantités puis formulaire de commande (sans paiement). */
export function Checkout({ whatsappNumber, privacySlug }: { whatsappNumber: string | null; privacySlug: string | null }) {
  const t = useTranslations('Shop')
  const locale = useLocale()
  const { items, total, ready, setQuantity, remove, clear } = useCart()
  // Après l'envoi, le panier est vidé mais le formulaire reste affiché pour montrer la confirmation
  const [submitted, setSubmitted] = useState(false)
  const onSuccess = useCallback(() => {
    setSubmitted(true)
    clear()
  }, [clear])

  if (!ready) return <div className="h-40 animate-pulse rounded-md bg-surface-sunken" aria-hidden />

  const cartSummary =
    items.length === 0 ? null : (
      <section aria-labelledby="panier-titre" className="flex flex-col gap-4">
        <h2 id="panier-titre" className="font-display text-xl font-bold [font-stretch:110%]">
          {t('cart')}
        </h2>
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-[4rem_1fr] gap-x-4 gap-y-3 py-4 sm:grid-cols-[4rem_1fr_auto_auto] sm:items-center">
              <div className="relative size-16 overflow-hidden rounded-md bg-surface-sunken">
                {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex flex-col">
                <Link href={`/boutique/${item.slug}`} className="font-semibold hover:text-accent">
                  {item.name}
                </Link>
                <span className="font-mono text-xs text-muted">
                  {item.reference} · {formatGNF(item.price, locale)} / {item.unit}
                </span>
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                <QuantityInput value={item.quantity} onChange={(n) => setQuantity(item.id, n)} id={`panier-qte-${item.id}`} label={`${t('quantity')} – ${item.name}`} />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={t('remove', { name: item.name })}
                  className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-surface-sunken hover:text-danger"
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </div>
              <p className="col-start-2 font-mono font-semibold tabular-nums sm:col-start-auto sm:text-right">
                {formatGNF(item.price * item.quantity, locale)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-semibold">{t('total')}</span>
          <span className="font-display text-2xl font-extrabold tabular-nums [font-stretch:112%]" data-testid="total-panier">
            {formatGNF(total, locale)}
          </span>
        </div>
        <p className="rounded-md bg-surface-sunken p-3 text-sm text-muted">{t('noPayment')}</p>
        {/* Seuls l'identifiant et la quantité partent au serveur : il relit les prix en base */}
        <input type="hidden" name="cart" value={JSON.stringify(items.map((i) => ({ id: i.id, quantity: i.quantity })))} />
      </section>
    )

  return (
    <div className="flex flex-col gap-8">
      {items.length === 0 && !submitted && (
        <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-line p-8">
          <ShoppingBag className="size-8 text-muted" aria-hidden />
          <p>{t('emptyCart')}</p>
          <Link href="/boutique" className={buttonVariants({ variant: 'outline' })}>
            {t('continue')}
          </Link>
        </div>
      )}
      {(items.length > 0 || submitted) && (
        <RequestForm service="boutique" whatsappNumber={whatsappNumber} privacySlug={privacySlug} onSuccess={onSuccess}>
          {cartSummary}
        </RequestForm>
      )}
    </div>
  )
}
