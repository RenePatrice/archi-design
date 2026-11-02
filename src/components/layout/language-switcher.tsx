'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/** Liens FR / EN qui gardent la page en cours. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('Language')
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav aria-label={t('label')} className={cn('flex items-center font-mono text-sm', className)}>
      {routing.locales.map((code, index) => (
        <span key={code} className="flex items-center">
          {index > 0 && <span className="px-1 text-muted" aria-hidden>/</span>}
          <Link
            href={pathname}
            locale={code}
            lang={code}
            hrefLang={code}
            aria-current={code === locale ? 'true' : undefined}
            aria-label={t(code)}
            className={cn(
              'inline-flex min-h-11 min-w-8 items-center justify-center uppercase',
              code === locale ? 'font-semibold text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {code}
          </Link>
        </span>
      ))}
    </nav>
  )
}
