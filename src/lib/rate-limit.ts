/**
 * Limitation de débit simple, en mémoire : au plus `max` envois par adresse IP sur `windowMs`.
 * Suffisant pour un seul serveur ; à remplacer par Redis ou la base si le site tourne
 * sur plusieurs instances (phase 6).
 */
const hits = new Map<string, number[]>()

// En développement et pendant les tests automatisés, la limite est 20 fois plus large
const devFactor = process.env.NODE_ENV === 'production' ? 1 : 20

export function isRateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
  if (recent.length >= max * devFactor) {
    hits.set(key, recent)
    return true
  }
  recent.push(now)
  hits.set(key, recent)

  // Nettoyage occasionnel pour ne pas garder des adresses inactives en mémoire
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k)
  }
  return false
}
