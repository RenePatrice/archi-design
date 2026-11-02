'use client'

import { MapPinned } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { MapPoint } from './map-canvas'

// Bibliothèque cartographique téléchargée seulement après le clic du visiteur
const MapCanvas = dynamic(() => import('./map-canvas'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface-sunken" aria-hidden />,
})

export function ProjectMap({ points }: { points: MapPoint[] }) {
  const t = useTranslations('Map')
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-surface-sunken sm:aspect-[16/10]">
      {loaded ? (
        <MapCanvas points={points} openLabel={t('open')} attribution={t('attribution')} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {/* Aperçu statique : silhouette des points, sans rien télécharger */}
          <MapPinned className="size-10 text-accent" aria-hidden />
          <Button size="lg" onClick={() => setLoaded(true)}>
            {t('load')}
          </Button>
          <p className="max-w-sm text-sm text-muted">{t('loadHint')}</p>
        </div>
      )}
    </div>
  )
}
