'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'

type Theme = 'system' | 'light' | 'dark'
const order: Theme[] = ['system', 'light', 'dark']
const icons = { system: Monitor, light: Sun, dark: Moon }

/*
 * Le thème vit dans l'attribut data-theme de <html> (posé avant l'affichage par ThemeScript).
 * Ce petit « store » permet à React de le lire sans décalage à l'hydratation.
 */
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Theme {
  const value = document.documentElement.getAttribute('data-theme')
  return value === 'light' || value === 'dark' ? value : 'system'
}

function applyTheme(value: Theme) {
  const root = document.documentElement
  if (value === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', value)
  try {
    if (value === 'system') localStorage.removeItem('theme')
    else localStorage.setItem('theme', value)
  } catch {
    // navigation privée : le choix s'applique quand même pour la visite en cours
  }
  listeners.forEach((listener) => listener())
}

/** Bouton qui alterne Automatique → Clair → Sombre et mémorise le choix sur l'appareil. */
export function ThemeToggle() {
  const t = useTranslations('Theme')
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'system' as Theme)

  const Icon = icons[theme]
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => applyTheme(order[(order.indexOf(theme) + 1) % order.length])}
      aria-label={`${t('label')} : ${t(theme)}`}
      title={t(theme)}
    >
      <Icon aria-hidden />
    </Button>
  )
}
