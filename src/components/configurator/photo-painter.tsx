'use client'

import { ImagePlus, RotateCcw, Undo2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { floodFillMask, recolor } from '@/lib/configurator/recolor'

const MAX_SIDE = 1200

/**
 * Peinture sur photo : le visiteur touche un mur, la zone de couleur voisine est repeinte.
 * L'image ne quitte jamais l'appareil (aucun envoi au serveur).
 */
export function PhotoPainter({ color }: { color: string }) {
  const t = useTranslations('Configurator')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalRef = useRef<ImageData | null>(null)
  const historyRef = useRef<ImageData[]>([])
  const [hasImage, setHasImage] = useState(false)
  const [historySize, setHistorySize] = useState(0)
  const [tolerance, setTolerance] = useState(38)

  const context = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null

  const loadFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    const bitmap = await createImageBitmap(file)
    // Réduction pour rester fluide sur les téléphones d'entrée de gamme
    const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = canvasRef.current!
    canvas.width = Math.round(bitmap.width * ratio)
    canvas.height = Math.round(bitmap.height * ratio)
    const ctx = context()!
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    originalRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current = []
    setHistorySize(0)
    setHasImage(true)
  }

  const paintAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = context()
    if (!canvas || !ctx || !hasImage) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width)
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height)
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current.push(current)
    setHistorySize(historyRef.current.length)
    // La zone est calculée sur la photo d'origine : repeindre un mur déjà peint reste précis
    const mask = floodFillMask(originalRef.current ?? current, x, y, tolerance)
    ctx.putImageData(recolor(current, mask, color), 0, 0)
  }

  const undo = () => {
    const previous = historyRef.current.pop()
    if (previous) context()?.putImageData(previous, 0, 0)
    setHistorySize(historyRef.current.length)
  }

  const reset = () => {
    if (originalRef.current) context()?.putImageData(originalRef.current, 0, 0)
    historyRef.current = []
    setHistorySize(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-ink/30 px-4 font-semibold hover:border-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus">
          <ImagePlus className="size-5" aria-hidden />
          {t('photoPick')}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} />
        </label>
        <Button variant="ghost" onClick={undo} disabled={historySize === 0}>
          <Undo2 aria-hidden />
          {t('undo')}
        </Button>
        <Button variant="ghost" onClick={reset} disabled={!hasImage}>
          <RotateCcw aria-hidden />
          {t('reset')}
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-md border border-line bg-surface-sunken">
        <canvas
          ref={canvasRef}
          onPointerDown={paintAt}
          className={hasImage ? 'block h-auto w-full cursor-crosshair touch-manipulation' : 'hidden'}
          aria-label={t('photoHint')}
        />
        {!hasImage && <p className="p-10 text-center text-sm text-muted">{t('photoEmpty')}</p>}
      </div>

      {hasImage && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">{t('photoHint')}</p>
          <label className="flex items-center gap-3 text-sm font-semibold">
            {t('tolerance')}
            <input
              type="range"
              min={10}
              max={90}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="h-11 flex-1 accent-[var(--accent)]"
            />
          </label>
        </div>
      )}
    </div>
  )
}
