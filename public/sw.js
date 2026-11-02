/*
 * Service worker ARCHI-DESIGN : garde le site consultable avec une connexion faible ou coupée.
 *
 * Stratégies :
 * - pages HTML     : réseau d'abord, puis copie en cache, puis page « hors ligne »
 * - fichiers /_next/static, polices, icônes : cache d'abord (ils ne changent jamais d'URL)
 * - images /api/media : cache d'abord avec mise à jour en arrière-plan
 * - back-office (/admin) et API : jamais mis en cache
 *
 * Changer VERSION force le renouvellement des caches chez tous les visiteurs.
 */
const VERSION = 'v1'
const PAGES = `ad-pages-${VERSION}`
const STATIC = `ad-static-${VERSION}`
const IMAGES = `ad-images-${VERSION}`
const OFFLINE_URL = '/offline.html'
const MAX_PAGES = 40
const MAX_IMAGES = 80

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

/** Limite la taille d'un cache pour ne pas remplir la mémoire des téléphones d'entrée de gamme. */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i])
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
      trim(PAGES, MAX_PAGES)
    }
    return response
  } catch {
    return (await cache.match(request)) || (await caches.match(OFFLINE_URL))
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGES)
  const cached = await cache.match(request)
  const update = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
        trim(IMAGES, MAX_IMAGES)
      }
      return response
    })
    .catch(() => cached)
  return cached || update
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin')) return

  if (url.pathname.startsWith('/api/media/file/')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }
  if (url.pathname.startsWith('/api')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC))
  }
})
