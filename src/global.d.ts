import type { routing } from '@/i18n/routing'
import type messages from '@/messages/fr.json'

// Vérifie à la compilation que chaque clé de traduction utilisée existe dans fr.json
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
