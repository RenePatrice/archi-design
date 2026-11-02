'use client'

import { useLocale } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

/**
 * Nombre qui défile de 0 à sa valeur quand il apparaît à l'écran.
 * La valeur finale est affichée dès le rendu serveur : sans JavaScript, ou si le
 * visiteur a demandé moins d'animations, le chiffre est simplement visible.
 */
export function Counter({ value, suffix }: { value: number; suffix?: string | null }) {
  const locale = useLocale()
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const format = (n: number) => new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB').format(n)

  useEffect(() => {
    const node = ref.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const duration = 1400
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ralentit en fin de course
          setDisplay(Math.round(value * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} className="tabular-nums">
      {/* Les lecteurs d'écran lisent directement la valeur finale */}
      <span aria-hidden>
        {format(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {format(value)}
        {suffix}
      </span>
    </span>
  )
}
