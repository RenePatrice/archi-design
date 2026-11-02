import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Politique de sécurité du contenu (CSP) du site public : le navigateur ne charge que des ressources
 * du site et des services utilisés (fond de carte, Vercel Blob, décodeur 3D, plan OpenStreetMap).
 * Sans nonce (incompatible avec les pages statiques) : les scripts en ligne de Next.js restent permis,
 * mais aucun script externe ne peut être injecté. Le back-office (/admin) a ses propres besoins.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://tiles.openfreemap.org",
  "font-src 'self' data:",
  "connect-src 'self' https://tiles.openfreemap.org https://*.public.blob.vercel-storage.com https://www.gstatic.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  'frame-src https://www.openstreetmap.org',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

/** En-têtes de sécurité appliqués à toutes les réponses. */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Génération des PDF côté serveur : bibliothèque chargée telle quelle par Node.js
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
    // Fichiers joints aux demandes : total autorisé + marge pour les champs du formulaire
    serverActions: { bodySizeLimit: `${(Number(process.env.NEXT_PUBLIC_UPLOAD_TOTAL_MB) || 50) + 5}mb` as `${number}mb` },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Images publiques stockées sur Vercel Blob (hébergement Vercel)
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/((?!admin|api).*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        // Le service worker doit toujours être relu pour que les mises à jour arrivent
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
