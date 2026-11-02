'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

export type GalleryImage = { url: string; alt: string }

/**
 * Galerie de la fiche produit : grande photo avec zoom qui suit la souris, vignettes cliquables.
 * Le zoom ne s'active qu'avec une souris (pas au toucher).
 */
export function ProductGallery({ images, labels }: { images: GalleryImage[]; /** Libellé de chaque vignette (« Photo 1 »…) */ labels: string[] }) {
  const [index, setIndex] = useState(0)
  const [origin, setOrigin] = useState<string | null>(null)
  const current = images[index]
  if (!current) return <div className="aspect-square bg-surface-sunken" />

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-3 sm:flex-col">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={labels[i]}
                aria-pressed={i === index}
                className={cn(
                  'relative block size-16 overflow-hidden bg-surface-sunken ring-offset-2 ring-offset-bg transition-all sm:size-20',
                  i === index ? 'ring-1 ring-ink' : 'opacity-60 hover:opacity-100',
                )}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden bg-surface-sunken"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
        }}
        onMouseLeave={() => setOrigin(null)}
      >
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="fade-up object-cover transition-transform duration-500 ease-expo"
          style={{ transform: origin ? 'scale(1.8)' : 'scale(1)', transformOrigin: origin ?? 'center' }}
        />
      </div>
    </div>
  )
}
