import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { JsonLd } from '@/components/seo/json-ld'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/seo'

type Crumb = { label: string; href?: string }

/** Fil d'Ariane visible + sa version schema.org (BreadcrumbList) pour Google. */
export async function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const t = await getTranslations('Common')
  const all: Crumb[] = [{ label: t('home'), href: '/' }, ...items]

  return (
    <>
      <nav aria-label={t('breadcrumb')} className="text-[0.6875rem] tracking-[0.14em] uppercase text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((crumb, index) => {
            const last = index === all.length - 1
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="inline-flex min-h-8 items-center hover:text-ink hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className="text-ink">
                    {crumb.label}
                  </span>
                )}
                {!last && <ChevronRight className="size-3.5" aria-hidden />}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            ...(crumb.href ? { item: absoluteUrl(locale, crumb.href) } : {}),
          })),
        }}
      />
    </>
  )
}
