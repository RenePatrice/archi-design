import { setRequestLocale } from 'next-intl/server'

import { ClientMessages } from '@/components/i18n/client-messages'
import type { Locale } from '@/i18n/routing'

/** Traductions transmises aux composants interactifs de cette rubrique (voir ClientMessages). */
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  // Langue fixée explicitement : la rubrique reste générée en statique
  setRequestLocale(locale as Locale)
  return <ClientMessages namespaces={['Contact', 'Form']}>{children}</ClientMessages>
}
