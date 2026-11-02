'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/** Enveloppe de l'en-tête : dès que la page défile, l'en-tête prend une ombre légère. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        'site-header sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-line bg-bg/85 backdrop-blur-md transition-shadow duration-500',
        scrolled && 'shadow-[0_10px_30px_-20px_rgba(18,17,16,0.35)]',
      )}
    >
      {children}
    </header>
  )
}
