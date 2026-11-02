'use client'

import { Box, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createElement, useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  src: string
  poster: string | null
  alt: string
  cameraOrbit?: string | null
  /** Taille du fichier, affichée avant le chargement (données mobiles) */
  sizeLabel: string
}

/**
 * Maquette 3D interactive (Google model-viewer) : rotation, zoom et réalité augmentée.
 * La bibliothèque et la maquette ne sont téléchargées que si le visiteur le demande.
 */
export function ModelViewer({ src, poster, alt, cameraOrbit, sizeLabel }: Props) {
  const t = useTranslations('Model3D')
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  const load = async () => {
    setState('loading')
    try {
      await import('@google/model-viewer')
      setState('ready')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-sunken">
      {state === 'ready' ? (
        // Élément web <model-viewer> : créé ainsi pour éviter de déclarer ses types JSX
        createElement(
          'model-viewer',
          {
            src,
            alt,
            poster: poster ?? undefined,
            'camera-controls': '',
            'touch-action': 'pan-y',
            'auto-rotate': '',
            'auto-rotate-delay': '1500',
            'camera-orbit': cameraOrbit ?? '35deg 70deg auto',
            'shadow-intensity': '1',
            exposure: '1.05',
            ar: '',
            'ar-modes': 'webxr scene-viewer quick-look',
            loading: 'eager',
            style: { width: '100%', height: '100%', backgroundColor: 'var(--surface-sunken)' },
          },
          createElement(
            'button',
            {
              slot: 'ar-button',
              type: 'button',
              className:
                'absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 font-semibold text-accent-ink shadow-md',
            },
            createElement(Smartphone, { className: 'size-5', 'aria-hidden': true }),
            t('ar'),
          ),
        )
      ) : (
        <>
          {poster && <Image src={poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover opacity-60" />}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/40 p-6 text-center backdrop-blur-[1px]">
            <Box className="size-10 text-accent" aria-hidden />
            <Button onClick={load} disabled={state === 'loading'}>
              {state === 'loading' ? t('loading') : t('load')}
            </Button>
            <p className="max-w-sm text-sm">{t('loadHint', { size: sizeLabel })}</p>
            {state === 'error' && (
              <p role="alert" className="text-sm text-danger">
                {t('error')}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
