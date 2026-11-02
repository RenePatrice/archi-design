'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

/**
 * Fait apparaître son contenu en fondu quand il entre à l'écran (classe .reveal de globals.css).
 * Sans JavaScript ou avec « moins d'animations », le contenu reste simplement visible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  variant = 'up',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'section' | 'article' | 'figure'
  /** up : glisse vers le haut · left/right : arrive de côté · scale : grandit · clip : rideau (images) */
  variant?: 'up' | 'left' | 'right' | 'scale' | 'clip'
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.classList.add('reveal')
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible')
          obs.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={variant}
      className={cn(className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
