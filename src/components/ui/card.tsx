import * as React from 'react'

import { cn } from '@/lib/utils'

/** Carte simple : fond clair, filet fin, angles droits. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-line bg-surface p-6', className)} {...props} />
}

/** Étiquette courte (pôle, statut, ville). `tone` suit les rôles de couleur du design system. */
export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'deep' | 'creative' }) {
  const tones = {
    neutral: 'border-line text-muted',
    accent: 'border-accent/40 text-accent',
    deep: 'border-deep/40 text-deep',
    creative: 'border-creative/40 text-creative',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.18em] uppercase',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
