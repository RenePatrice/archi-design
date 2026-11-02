import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

const siteHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').host
  } catch {
    return 'localhost:3000'
  }
})()

/**
 * Payload renvoie des adresses absolues (http://site/api/media/…) quand l'URL du site est configurée :
 * on garde alors le chemin seul pour que next/image la traite comme une image locale.
 * Une adresse externe (Vercel Blob) est conservée telle quelle.
 */
export function mediaPath(url: string): string {
  if (!url.startsWith('http')) return url
  const parsed = new URL(url)
  return parsed.host === siteHost || parsed.hostname === 'localhost' ? parsed.pathname : url
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
