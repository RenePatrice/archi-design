'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { valueChain } from '@/lib/navigation'
import { cn } from '@/lib/utils'

type Props = {
  /** Adresse (slug) de la page de chaque pôle, ex. { architecture: 'architecture-et-design' } */
  poleSlugs: Record<string, string>
}

/**
 * Chaîne de valeur interactive : 8 étapes reliées, chacune ouvre une description,
 * le « pack intégré » et un lien vers le pôle qui la réalise.
 * Navigation clavier : flèches gauche/droite, Début, Fin (modèle « onglets » ARIA).
 */
export function ValueChain({ poleSlugs }: Props) {
  const t = useTranslations('Chain')
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number) => {
    const next = (index + valueChain.length) % valueChain.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: valueChain.length - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      select(moves[event.key])
    }
  }

  const current = valueChain[active]
  const slug = poleSlugs[current.pole]

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      {/* Étapes : liste verticale sur téléphone, grille 4 × 2 sur grand écran */}
      <div role="tablist" aria-label={t('label')} aria-orientation="vertical" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {valueChain.map(({ step }, index) => {
          const selected = index === active
          return (
            <button
              key={step}
              ref={(node) => {
                tabs.current[index] = node
              }}
              id={`chaine-onglet-${step}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="chaine-panneau"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
              className={cn(
                'group flex min-h-20 flex-col items-start justify-between gap-2 rounded-md border p-3 text-left transition-colors',
                selected ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface hover:border-ink/40',
              )}
            >
              <span className={cn('font-mono text-xs tabular-nums', selected ? 'opacity-80' : 'text-accent')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm leading-tight font-semibold">{t(`steps.${step}.name`)}</span>
            </button>
          )
        })}
      </div>

      <div
        id="chaine-panneau"
        role="tabpanel"
        aria-labelledby={`chaine-onglet-${current.step}`}
        className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5 sm:p-6"
      >
        <p className="font-mono text-xs text-muted tabular-nums">
          {String(active + 1).padStart(2, '0')} / {String(valueChain.length).padStart(2, '0')}
        </p>
        <h3 className="text-2xl font-bold">{t(`steps.${current.step}.name`)}</h3>
        <p>{t(`steps.${current.step}.text`)}</p>
        <div className="flex flex-col gap-1 border-l-4 border-deep pl-4">
          <p className="eyebrow">{t('pack')}</p>
          <p className="text-muted">{t(`steps.${current.step}.pack`)}</p>
        </div>
        {slug && (
          <Link
            href={`/services/${slug}`}
            className="mt-auto inline-flex min-h-11 items-center gap-2 self-start font-semibold text-accent hover:underline"
          >
            {t('open')}
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  )
}
