import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// Détecte la langue du visiteur et ajoute le préfixe /en si nécessaire
export default createMiddleware(routing)

export const config = {
  // Ignore le back-office, l'API, les PDF générés, les fichiers internes de Next.js et tout fichier avec une extension
  matcher: ['/((?!admin|api|pdf|health|_next|_vercel|.*\\..*).*)'],
}
