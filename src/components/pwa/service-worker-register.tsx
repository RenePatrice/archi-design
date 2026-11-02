'use client'

import { useEffect } from 'react'

/** Enregistre le service worker (mode hors ligne) uniquement en production. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    // Attend la fin du chargement pour ne pas ralentir le premier affichage
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
