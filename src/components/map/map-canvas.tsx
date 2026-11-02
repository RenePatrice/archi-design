'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import { LngLatBounds, Map, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl'
import { useEffect, useRef } from 'react'

export type MapPoint = {
  id: number
  slug: string
  title: string
  city: string
  year: number
  href: string
  lat: number
  lng: number
  pole: string
  /** Vignette de la photo principale (popup et liste) */
  image?: string | null
}

// Le worker de MapLibre est servi tel quel depuis public/vendor (copié par scripts/copy-vendor.mjs)
setWorkerUrl('/vendor/maplibre-gl-worker.mjs')

/** Échappe le texte inséré dans les bulles de la carte. */
const escape = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

/** Repère en forme de goutte, couleur terre cuite, avec un halo qui pulse. */
const PIN = `<span class="map-pin__halo"></span><svg viewBox="0 0 32 42" width="30" height="40" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 41 16 41s15-14 15-25.2C31 7.6 24.3 1 16 1z" fill="#A65A2E" stroke="#fff" stroke-width="2"/><circle cx="16" cy="15.5" r="5" fill="#fff"/></svg>`

/**
 * Carte MapLibre avec fond OpenFreeMap « Positron » (gris clair, gratuit, sans clé).
 * Chargée uniquement à la demande du visiteur (voir ProjectMap), car la bibliothèque pèse plusieurs centaines de Ko.
 * `selectedId` : le projet choisi dans la liste ; la carte s'y déplace et ouvre sa bulle.
 */
export default function MapCanvas({
  points,
  openLabel,
  attribution,
  selectedId,
  onSelect,
}: {
  points: MapPoint[]
  openLabel: string
  attribution: string
  selectedId?: number | null
  onSelect?: (id: number) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markers = useRef(new globalThis.Map<number, Marker>())
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!container.current) return
    const map = new Map({
      container: container.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [-11.5, 10.2], // centre de la Guinée
      zoom: 5.6,
      attributionControl: { compact: true, customAttribution: attribution },
      cooperativeGestures: true, // deux doigts pour déplacer : la page reste défilable sur téléphone
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    for (const point of points) {
      const el = document.createElement('button')
      el.type = 'button'
      el.setAttribute('aria-label', `${point.title}, ${point.city}`)
      el.className = 'map-pin'
      el.innerHTML = PIN
      el.addEventListener('click', () => onSelectRef.current?.(point.id))
      const popup = new Popup({ offset: [0, -36], closeButton: true, maxWidth: '280px', className: 'map-popup' }).setHTML(
        `${point.image ? `<img src="${escape(point.image)}" alt="" class="map-popup__img" />` : ''}
         <div class="map-popup__body">
           <p class="map-popup__pole">${escape(point.pole)}</p>
           <p class="map-popup__title">${escape(point.title)}</p>
           <p class="map-popup__meta">${escape(point.city)} · ${point.year}</p>
           <a href="${escape(point.href)}" class="map-popup__link">${escape(openLabel)} →</a>
         </div>`,
      )
      const marker = new Marker({ element: el, anchor: 'bottom' }).setLngLat([point.lng, point.lat]).setPopup(popup).addTo(map)
      markers.current.set(point.id, marker)
    }

    if (points.length > 1) {
      const bounds = new LngLatBounds()
      points.forEach((p) => bounds.extend([p.lng, p.lat]))
      map.fitBounds(bounds, { padding: 70, maxZoom: 11, duration: 0 })
    }
    const registry = markers.current
    return () => {
      registry.clear()
      map.remove()
      mapRef.current = null
    }
  }, [points, openLabel, attribution])

  // Projet choisi dans la liste : vol jusqu'au repère, bulle ouverte
  useEffect(() => {
    const map = mapRef.current
    if (!map || selectedId == null) return
    const marker = markers.current.get(selectedId)
    if (!marker) return
    markers.current.forEach((m) => m.getPopup()?.isOpen() && m !== marker && m.togglePopup())
    map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), 12), speed: 1.4, curve: 1.5, essential: true })
    if (!marker.getPopup()?.isOpen()) marker.togglePopup()
  }, [selectedId])

  return <div ref={container} className="h-full w-full" data-testid="carte-maplibre" />
}
