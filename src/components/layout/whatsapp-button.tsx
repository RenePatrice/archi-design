'use client'

import { MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import { buildWhatsAppLink } from '@/lib/whatsapp'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

/**
 * Bouton WhatsApp flottant. Le message pré-rempli cite la page consultée
 * pour que l'équipe sache d'où vient la demande.
 * Ne s'affiche pas si aucun numéro n'est configuré.
 */
export function WhatsAppButton({ number, message }: { number: string | null; message?: string }) {
  const t = useTranslations('WhatsApp')

  // Même valeur côté serveur et navigateur (pas de window ici, pour éviter un écart à l'hydratation)
  const pathname = usePathname()
  const pageUrl = siteUrl ? `${siteUrl}${pathname}` : ''
  const text = [message ?? t('defaultMessage'), pageUrl].filter(Boolean).join('\n')
  const href = buildWhatsAppLink(number, text)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('button')}
      className="fixed z-40 flex size-14 items-center justify-center rounded-full bg-[#1f7a4d] text-white shadow-lg transition-transform hover:scale-105"
      style={{
        right: 'calc(1rem + env(safe-area-inset-right, 0px))',
        bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  )
}
