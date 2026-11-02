import { getTranslations } from 'next-intl/server'

import { LineIcon } from '@/components/ui/ornaments'
import { cn } from '@/lib/utils'

const items = [
  ['delivery', 'truck'],
  ['payment', 'cash'],
  ['advice', 'palette'],
  ['quality', 'shield'],
] as const

/** Les quatre garanties de la boutique, avec pictogrammes au trait. */
export async function TrustBar({ compact, className }: { compact?: boolean; className?: string }) {
  const t = await getTranslations('Shop.trust')
  return (
    <ul className={cn('grid border-y border-line', compact ? 'grid-cols-2 gap-y-5 py-5' : 'grid-cols-2 lg:grid-cols-4', className)}>
      {items.map(([key, icon], i) => (
        <li
          key={key}
          className={cn('flex items-center gap-4', compact ? 'pr-3' : 'py-6 lg:px-6 lg:first:pl-0 lg:not-first:border-l lg:not-first:border-line', !compact && i % 2 === 1 && 'pl-4 lg:pl-6')}
        >
          <LineIcon name={icon} className={cn('shrink-0 text-accent', compact ? 'size-7' : 'size-9')} />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">{t(`${key}.title`)}</span>
            <span className="text-xs text-muted">{t(`${key}.text`)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
