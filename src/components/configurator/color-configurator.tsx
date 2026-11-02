'use client'

import { Check, ShoppingBag } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { useCart } from '@/components/shop/cart'
import { Button, buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { formatGNF } from '@/lib/requests/print-pricing'
import { cn } from '@/lib/utils'

import { PhotoPainter } from './photo-painter'
import { ROOM_SURFACES, RoomScene, type RoomKind, type Surface } from './room-scene'

export type PaintColor = { id: number; slug: string; name: string; reference: string; hex: string; price: number; unit: string; image: string | null }

/** Configurateur : pièce type (SVG) ou photo du visiteur, nuancier tiré des peintures de la boutique. */
export function ColorConfigurator({ colors }: { colors: PaintColor[] }) {
  const t = useTranslations('Configurator')
  const locale = useLocale()
  const { add } = useCart()
  const [mode, setMode] = useState<'room' | 'photo'>('room')
  const [room, setRoom] = useState<RoomKind>('salon')
  const [surface, setSurface] = useState<Surface>('walls')
  const [selected, setSelected] = useState<PaintColor | null>(colors[0] ?? null)
  const [painted, setPainted] = useState<Record<RoomKind, Partial<Record<Surface, string>>>>({ salon: {}, chambre: {}, facade: {} })
  const [addedId, setAddedId] = useState<number | null>(null)

  const surfaces = ROOM_SURFACES[room]
  const currentSurface = surfaces.includes(surface) ? surface : surfaces[0]

  const pick = (color: PaintColor) => {
    setSelected(color)
    setAddedId(null)
    if (mode === 'room') setPainted((prev) => ({ ...prev, [room]: { ...prev[room], [currentSurface]: color.hex } }))
  }

  if (colors.length === 0) return <p className="rounded-md bg-surface-sunken p-6 text-muted">{t('noColors')}</p>

  const tab = (active: boolean) =>
    cn('min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors', active ? 'border-ink bg-ink text-bg' : 'border-line bg-surface hover:border-ink/50')

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="flex flex-col gap-5">
        <div role="group" aria-label={t('modeLabel')} className="flex flex-wrap gap-2">
          {(['room', 'photo'] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={tab(mode === m)}>
              {t(`modes.${m}`)}
            </button>
          ))}
        </div>

        {mode === 'room' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {(['salon', 'chambre', 'facade'] as const).map((r) => (
                <button key={r} type="button" aria-pressed={room === r} onClick={() => setRoom(r)} className={tab(room === r)}>
                  {t(`rooms.${r}`)}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-md border border-line">
              <RoomScene kind={room} colors={painted[room]} label={t(`rooms.${room}`)} />
            </div>
            <fieldset className="flex flex-wrap items-center gap-2">
              <legend className="mb-2 text-sm font-semibold">{t('surfaceLabel')}</legend>
              {surfaces.map((s) => (
                <button key={s} type="button" aria-pressed={currentSurface === s} onClick={() => setSurface(s)} className={tab(currentSurface === s)}>
                  {t(`surfaces.${s}`)}
                  {painted[room][s] && <span className="ml-2 inline-block size-3 rounded-full border border-white/50 align-middle" style={{ backgroundColor: painted[room][s] }} aria-hidden />}
                </button>
              ))}
            </fieldset>
          </div>
        ) : (
          selected && <PhotoPainter color={selected.hex} />
        )}
        <p className="text-xs text-muted">{t('disclaimer')}</p>
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
        <section aria-labelledby="nuancier" className="flex flex-col gap-3">
          <h2 id="nuancier" className="text-xl font-bold">
            {t('palette')}
          </h2>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
            {colors.map((color) => (
              <li key={color.id}>
                <button
                  type="button"
                  onClick={() => pick(color)}
                  aria-pressed={selected?.id === color.id}
                  aria-label={color.name}
                  title={color.name}
                  className={cn(
                    'relative flex aspect-square w-full items-center justify-center rounded-md border border-line transition-transform hover:scale-105',
                    selected?.id === color.id && 'ring-3 ring-ink ring-offset-2 ring-offset-bg',
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {selected?.id === color.id && <Check className="size-5 text-white mix-blend-difference" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {selected && (
          <section aria-labelledby="teinte-choisie" className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5">
            <h2 id="teinte-choisie" className="eyebrow [font-family:var(--font-mono)] [font-stretch:100%]">
              {t('selected')}
            </h2>
            <div className="flex items-center gap-3">
              <span className="size-12 shrink-0 rounded-md border border-line" style={{ backgroundColor: selected.hex }} aria-hidden />
              <div className="flex flex-col">
                <span className="font-semibold">{selected.name}</span>
                <span className="font-mono text-xs text-muted">
                  {selected.hex.toUpperCase()} · {selected.reference}
                </span>
              </div>
            </div>
            <p className="font-semibold tabular-nums">
              {formatGNF(selected.price, locale)} <span className="text-sm font-normal text-muted">/ {selected.unit}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  add({ id: selected.id, slug: selected.slug, name: selected.name, reference: selected.reference, price: selected.price, unit: selected.unit, image: selected.image })
                  setAddedId(selected.id)
                }}
              >
                {addedId === selected.id ? <Check aria-hidden /> : <ShoppingBag aria-hidden />}
                {t('addToCart')}
              </Button>
              <Link href={`/boutique/${selected.slug}`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                {t('seeProduct')}
              </Link>
            </div>
          </section>
        )}
      </aside>
    </div>
  )
}
