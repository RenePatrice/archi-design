import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'

type Namespace = keyof Awaited<ReturnType<typeof getMessages>>

/**
 * Transmet au navigateur uniquement les traductions des composants interactifs d'une rubrique.
 * Sans ce tri, les 37 Ko de textes du site partiraient dans le HTML de chaque page (lent en 3G).
 */
export async function ClientMessages({ namespaces, children }: { namespaces: Namespace[]; children: ReactNode }) {
  const all = await getMessages()
  const messages = Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]))
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
}
