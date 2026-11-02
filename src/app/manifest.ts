import type { MetadataRoute } from 'next'

/** Manifeste PWA : permet d'installer le site sur l'écran d'accueil du téléphone. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ARCHI-DESIGN Guinée',
    short_name: 'ARCHI-DESIGN',
    description: 'Architecture, BTP, design et métiers créatifs à Conakry.',
    lang: 'fr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F2F1EC',
    theme_color: '#1F4A3A',
    categories: ['business', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
