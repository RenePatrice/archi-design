'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import { LngLatBounds, Map, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

export type MapPoint = { id: number; slug: string; title: string; city: string; year: number; href: string; lat: number; lng: number; pole: string }

// Le worker de MapLibre est servi tel quel depuis public/vendor (copié par scripts/copy-vendor.mjs)
setWorkerUrl('/vendor/maplibre-gl-worker.mjs')

/** Échappe le texte inséré dans les bulles de la carte. */
const escape = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

/**
 * Carte MapLibre avec fond OpenFreeMap (gratuit, sans clé). Chargée uniquement à la demande
 * du visiteur (voir ProjectMap), car la bibliothèque pèse plusieurs centaines de Ko.
 */
export default function MapCanvas({ points, openLabel, attribution }: { points: MapPoint[]; openLabel: string; attribution: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const map = new Map({
      container: container.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-11.5, 10.2], // centre de la Guinée
      zoom: 5.6,
      attributionControl: { compact: true, customAttribution: attribution },
      cooperativeGestures: true, // deux doigts pour déplacer : la page reste défilable sur téléphone
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    for (const point of points) {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', `${point.title}, ${point.city}`)
      el.className = 'size-5 rounded-full border-[3px] border-white bg-[#A0521E] shadow-md transition-transform hover:scale-125'
      const popup = new Popup({ offset: 14, closeButton: true, maxWidth: '260px' }).setHTML(
        `<div style="font-family:var(--font-sans);color:#1C1E1D">
           <p style="margin:0;font:600 11px var(--font-mono);color:#A0521E;text-transform:uppercase;letter-spacing:.08em">${escape(point.pole)}</p>
           <p style="margin:4px 0 2px;font-weight:700;font-size:15px;line-height:1.2">${escape(point.title)}</p>
           <p style="margin:0 0 8px;font-size:13px;color:#4E5752">${escape(point.city)} · ${point.year}</p>
           <a href="${escape(point.href)}" style="color:#A0521E;font-weight:700;font-size:14px">${escape(openLabel)} →</a>
         </div>`,
      )
      new Marker({ element: el }).setLngLat([point.lng, point.lat]).setPopup(popup).addTo(map)
    }

    if (points.length > 1) {
      const bounds = new LngLatBounds()
      points.forEach((p) => bounds.extend([p.lng, p.lat]))
      map.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 0 })
    }
    return () => map.remove()
  }, [points, openLabel, attribution])

  return <div ref={container} className="h-full w-full" data-testid="carte-maplibre" />
}
