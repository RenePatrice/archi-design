'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Link, usePathname } from '@/i18n/navigation'
import { mainNav } from '@/lib/navigation'

import { LanguageSwitcher } from './language-switcher'

/** Menu plein écran pour téléphone. Se referme au changement de page et avec Échap. */
export function MobileMenu() {
  const t = useTranslations('Nav')
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)

  // Referme le menu quand la page change (ajustement pendant le rendu, sans effet)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? t('closeMenu') : t('openMenu')}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </Button>
      {open && (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]"
        >
          <nav aria-label={t('label')} className="container-site flex flex-col py-4">
            {mainNav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex min-h-13 items-center border-b border-line font-display text-xl font-bold"
              >
                {t(item.key)}
              </Link>
            ))}
            <Link href="/espace-client" className="flex min-h-13 items-center border-b border-line font-display text-xl font-bold text-accent">
              {t('clientArea')}
            </Link>
            <LanguageSwitcher className="mt-4" />
          </nav>
        </div>
      )}
    </div>
  )
}
