'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type GalleryImage = {
  id: string
  url: string
  /** Version légère pour la vignette */
  thumbUrl: string
  alt: string
  caption?: string | null
  width: number
  height: number
}

/**
 * Galerie : vignettes cliquables qui ouvrent une visionneuse plein écran (<dialog> natif).
 * Navigation au clavier (flèches, Échap) et par glissement du doigt sur téléphone.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const t = useTranslations('Projects')
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)
  const touchStart = useRef<number | null>(null)

  const open = (i: number) => {
    setIndex(i)
    dialog.current?.showModal()
  }
  const go = useCallback((step: number) => setIndex((i) => (i + step + images.length) % images.length), [images.length])

  useEffect(() => {
    const node = dialog.current
    if (!node) return
    const onKey = (e: KeyboardEvent) => {
      if (!node.open) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go])

  const current = images[index]

  return (
    <>
      {/* Nombre impair sur téléphone : la première image prend toute la largeur pour ne pas laisser de trou */}
      <ul
        className={cn(
          'grid grid-cols-2 gap-3 sm:grid-cols-3',
          images.length % 2 === 1 && '[&>li:first-child]:col-span-2 sm:[&>li:first-child]:col-span-1',
        )}
      >
        {images.map((image, i) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={t('openImage', { index: i + 1 })}
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-sunken"
            >
              <Image
                src={image.thumbUrl}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={t('gallery')}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-forge/95 p-0 text-kaolin backdrop:bg-forge/80"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return
          const delta = e.changedTouches[0].clientX - touchStart.current
          if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1)
          touchStart.current = null
        }}
      >
        {current && (
          <div className="flex h-full flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 py-2">
              <p className="font-mono text-sm" aria-live="polite">
                {t('imageOf', { index: index + 1, total: images.length })}
              </p>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label={t('close')}
                className="flex size-11 items-center justify-center rounded-md hover:bg-white/10"
              >
                <X aria-hidden />
              </button>
            </div>
            <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-2">
              <div className="relative h-full w-full">
                <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" />
              </div>
              {current.caption && <figcaption className="px-4 pb-2 text-center text-sm text-kaolin/80">{current.caption}</figcaption>}
            </figure>
            {images.length > 1 && (
              <div className="flex justify-center gap-4 py-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t('previous')}
                  className="flex size-12 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
                >
                  <ChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t('nextImage')}
                  className="flex size-12 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
                >
                  <ChevronRight aria-hidden />
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
