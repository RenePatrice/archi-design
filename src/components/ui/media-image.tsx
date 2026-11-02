import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

/**
 * Payload renvoie des adresses absolues (http://site/api/media/…) quand l'URL du site est configurée.
 * On garde le chemin seul : next/image l'optimise alors comme une image locale.
 */
export function mediaPath(url: string): string {
  return url.startsWith('http') ? new URL(url).pathname : url
}

type Props = {
  media: Media | number | null | undefined
  /** Largeurs d'affichage réelles, pour que le téléphone ne télécharge pas l'image 1600 px */
  sizes: string
  className?: string
  priority?: boolean
  /** Remplit le parent (qui doit être en position relative) */
  fill?: boolean
}

/**
 * Image de la médiathèque Payload, optimisée par Next.js (AVIF/WebP, tailles adaptées,
 * chargement différé). Le point focal choisi dans le back-office sert de cadrage.
 */
export function MediaImage({ media, sizes, className, priority, fill = true }: Props) {
  if (!media || typeof media === 'number' || !media.url) return null

  const position =
    media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : 'center'

  return (
    <Image
      src={mediaPath(media.url)}
      alt={media.alt}
      sizes={sizes}
      priority={priority}
      {...(fill ? { fill: true } : { width: media.width ?? 1600, height: media.height ?? 1000 })}
      className={cn('object-cover', className)}
      style={{ objectPosition: position }}
    />
  )
}
