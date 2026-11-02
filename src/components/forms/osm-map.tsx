'use client'

import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

/**
 * Carte OpenStreetMap chargée seulement à la demande : la page reste légère
 * et aucune donnée n'est envoyée à un tiers tant que le visiteur ne l'a pas choisi.
 */
export function OsmMap({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  const t = useTranslations('Contact')
  const [loaded, setLoaded] = useState(false)
  const d = 0.008
  const bbox = [longitude - d, latitude - d, longitude + d, latitude + d].join(',')
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`
  const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`

  return (
    <div className="flex flex-col gap-2">
      <div className="dot-grid relative aspect-[4/3] max-h-[420px] w-full overflow-hidden border border-line bg-surface-sunken sm:aspect-[21/9]">
        {loaded ? (
          <iframe src={embed} title={label} className="absolute inset-0 h-full w-full border-0" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <MapPin className="size-8 text-accent" aria-hidden />
            <Button variant="outline" onClick={() => setLoaded(true)}>
              {t('loadMap')}
            </Button>
            <p className="text-xs text-muted">{t('mapNotice')}</p>
          </div>
        )}
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline">
        {t('openMap')}
      </a>
    </div>
  )
}
