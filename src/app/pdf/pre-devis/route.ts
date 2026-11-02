import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'
import { isRateLimited } from '@/lib/rate-limit'
import { buildPreQuotePdf } from '@/lib/simulator/prequote'

/**
 * Téléchargement du pré-devis PDF : /pdf/pre-devis?lang=fr&type=villa&surface=200&finish=standard&zone=conakry
 * Placé hors de la zone multilingue [locale] (la langue est passée dans « lang ») et exclu du proxy.
 * L'estimation est recalculée ici à partir de la grille en base (les chiffres du navigateur ne comptent pas).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requested = url.searchParams.get('lang')
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  // Générer un PDF demande un peu de calcul : on limite les abus
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue'
  if (isRateLimited(`pdf:${ip}`, 20)) return new Response('Trop de demandes, réessayez dans quelques minutes.', { status: 429 })

  const built = await buildPreQuotePdf(
    {
      type: url.searchParams.get('type') ?? '',
      surface: Number(url.searchParams.get('surface')),
      finish: url.searchParams.get('finish') ?? 'standard',
      zone: url.searchParams.get('zone') ?? 'conakry',
    },
    locale,
  )
  if (!built) return new Response('Paramètres de simulation invalides.', { status: 400 })

  return new Response(new Uint8Array(built.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="pre-devis-archi-design-${built.reference}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
