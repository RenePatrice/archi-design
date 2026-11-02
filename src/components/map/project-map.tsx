'use client'

import { MapPinned, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CompassMark } from '@/components/ui/ornaments'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import type { MapPoint } from './map-canvas'

// Bibliothèque cartographique téléchargée seulement après le clic du visiteur
const MapCanvas = dynamic(() => import('./map-canvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-sunken" aria-hidden />,
})

/**
 * Aperçu avant chargement : les projets placés à leur vraie position (projection simple),
 * reliés comme une constellation. Rien n'est téléchargé.
 */
function Constellation({ points }: { points: MapPoint[] }) {
  if (points.length === 0) return null
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)]
  const x = (lng: number) => 60 + ((lng - minLng) / (maxLng - minLng || 1)) * 280
  const y = (lat: number) => 240 - ((lat - minLat) / (maxLat - minLat || 1)) * 180
  const sorted = [...points].sort((a, b) => a.lng - b.lng)
  return (
    <svg viewBox="0 0 400 300" className="draw draw-now absolute inset-x-0 top-0 h-[75%] w-full text-accent" aria-hidden>
      <polyline
        pathLength={1}
        points={sorted.map((p) => `${x(p.lng)},${y(p.lat)}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeDasharray="2 3"
        opacity="0.6"
      />
      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={x(p.lng)} cy={y(p.lat)} r="9" fill="currentColor" opacity="0.12">
            <animate attributeName="r" values="4;12;4" dur="3s" begin={`${(i % 6) * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={x(p.lng)} cy={y(p.lat)} r="3" fill="currentColor" />
        </g>
      ))}
    </svg>
  )
}

export function ProjectMap({ points }: { points: MapPoint[] }) {
  const t = useTranslations('Map')
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [pole, setPole] = useState('')
  const [selected, setSelected] = useState<number | null>(null)

  const poles = useMemo(() => [...new Set(points.map((p) => p.pole).filter(Boolean))], [points])
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return points.filter((p) => (!pole || p.pole === pole) && (!q || `${p.title} ${p.city}`.toLowerCase().includes(q)))
  }, [points, query, pole])

  const choose = (id: number) => {
    setSelected(id)
    if (!loaded) setLoaded(true)
  }

  return (
    <div className="grid overflow-hidden border border-line bg-surface lg:h-[680px] lg:grid-cols-[22rem_1fr]">
      {/* Liste des projets : recherche, filtre par pôle, clic = vol jusqu'au repère */}
      <div className="flex max-h-[520px] flex-col border-b border-line lg:max-h-none lg:border-r lg:border-b-0">
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <label className="relative block">
            <span className="sr-only">{t('search')}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="min-h-11 w-full border border-line bg-bg py-2 pr-3 pl-10 text-sm focus-visible:border-ink focus-visible:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('filter')}>
            {['', ...poles].map((p) => (
              <button
                key={p || 'tous'}
                type="button"
                aria-pressed={pole === p}
                onClick={() => setPole(p)}
                className={cn(
                  'min-h-8 border px-3 text-[0.625rem] font-semibold tracking-[0.14em] uppercase transition-colors',
                  pole === p ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink/50',
                )}
              >
                {p || t('all')}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted" aria-live="polite">
            {t('count', { count: visible.length })}
          </p>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {visible.map((p) => (
            <li key={p.id}>
              <div
                className={cn(
                  'group flex items-center gap-4 p-4 transition-colors',
                  selected === p.id ? 'bg-accent/10' : 'hover:bg-bg',
                )}
              >
                <span className="relative size-16 shrink-0 overflow-hidden bg-surface-sunken">
                  {p.image && <Image src={p.image} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-110" />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[0.625rem] font-semibold tracking-[0.16em] text-accent uppercase">{p.pole}</span>
                  <button type="button" onClick={() => choose(p.id)} className="truncate text-left font-display text-xl leading-tight hover:text-accent">
                    {p.title}
                  </button>
                  <span className="text-xs text-muted">
                    {p.city} · {p.year} ·{' '}
                    <Link href={`/realisations/${p.slug}`} className="underline-offset-2 hover:text-ink hover:underline">
                      {t('open')}
                    </Link>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Carte */}
      <div className="relative aspect-[4/5] bg-surface-sunken sm:aspect-[16/10] lg:aspect-auto">
        {loaded ? (
          <MapCanvas points={points} openLabel={t('open')} attribution={t('attribution')} selectedId={selected} onSelect={setSelected} />
        ) : (
          <div className="dot-grid absolute inset-0 overflow-hidden">
            <Constellation points={points} />
            <CompassMark className="absolute top-6 right-6 size-16 text-muted" />
            <div className="absolute bottom-6 left-1/2 flex w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 flex-col items-center gap-3 border border-line bg-bg/90 p-6 text-center shadow-xl backdrop-blur-md">
              <MapPinned className="size-8 text-accent" aria-hidden />
              <Button size="lg" onClick={() => setLoaded(true)}>
                {t('load')}
              </Button>
              <p className="max-w-sm text-xs text-muted">{t('loadHint')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
