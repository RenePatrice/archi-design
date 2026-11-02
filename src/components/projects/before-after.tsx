'use client'

import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

/**
 * Curseur avant / après : l'image « après » recouvre l'image « avant » et se découvre
 * en glissant. Le curseur est un vrai champ « range » : utilisable au doigt, à la souris
 * et au clavier (flèches), et annoncé par les lecteurs d'écran.
 */
export function BeforeAfter({ before, after }: { before: ReactNode; after: ReactNode }) {
  const t = useTranslations('Projects')
  const [position, setPosition] = useState(50)

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-sunken select-none">
      <div className="absolute inset-0">{before}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        {after}
      </div>

      {/* Ligne de séparation et poignée */}
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-mono text-sm text-forge shadow-md">
          ⟷
        </span>
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-sm bg-forge/80 px-2 py-1 font-mono text-xs text-white">
        {t('before')}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-sm bg-forge/80 px-2 py-1 font-mono text-xs text-white">
        {t('after')}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={t('sliderLabel')}
        aria-valuetext={`${position} %`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}
