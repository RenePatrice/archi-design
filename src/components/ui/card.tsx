import * as React from 'react'

import { cn } from '@/lib/utils'

/** Carte simple : fond blanc, filet fin, angles presque droits. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md border border-line bg-surface p-5', className)} {...props} />
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
        'inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs tracking-wide uppercase',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
