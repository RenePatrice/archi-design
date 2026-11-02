'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'

import { Select } from '@/components/ui/field'

export type FilterableProject = {
  id: number
  pole: string
  type: string
  city: string
  year: number
}

type Props = {
  projects: FilterableProject[]
  poles: { key: string; label: string }[]
  /** Cartes de projet déjà rendues par le serveur, indexées par identifiant */
  cards: Record<number, ReactNode>
}

/**
 * Met à jour les paramètres de l'adresse sans recharger la page ni interroger le serveur :
 * le filtrage se fait dans le navigateur, et Next.js synchronise useSearchParams avec l'historique.
 */
function replaceQuery(params: URLSearchParams) {
  const query = params.toString()
  window.history.replaceState(null, '', query ? `${window.location.pathname}?${query}` : window.location.pathname)
}

const FILTER_KEYS = ['pole', 'type', 'ville', 'annee'] as const
type FilterKey = (typeof FILTER_KEYS)[number]

/**
 * Filtres instantanés du portfolio. Les choix sont gardés dans l'adresse (?pole=…&ville=…)
 * pour pouvoir partager une sélection ; aucun rechargement de page n'est nécessaire.
 */
export function ProjectFilters({ projects, poles, cards }: Props) {
  const t = useTranslations('Projects')
  const types = useTranslations('ProjectTypes')
  const searchParams = useSearchParams()

  const selected = Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? ''])) as Record<FilterKey, string>

  const options = useMemo(
    () => ({
      type: [...new Set(projects.map((p) => p.type))],
      ville: [...new Set(projects.map((p) => p.city))].sort((a, b) => a.localeCompare(b, 'fr')),
      annee: [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a),
    }),
    [projects],
  )

  const visible = projects.filter(
    (p) =>
      (!selected.pole || p.pole === selected.pole) &&
      (!selected.type || p.type === selected.type) &&
      (!selected.ville || p.city === selected.ville) &&
      (!selected.annee || String(p.year) === selected.annee),
  )

  const update = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    replaceQuery(params)
  }

  const hasFilters = FILTER_KEYS.some((k) => selected[k])

  return (
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="eyebrow mb-3">{t('filters')}</legend>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('pole')}
            <Select value={selected.pole} onChange={(e) => update('pole', e.target.value)} id="filtre-pole">
              <option value="">{t('allPoles')}</option>
              {poles.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('type')}
            <Select value={selected.type} onChange={(e) => update('type', e.target.value)} id="filtre-type">
              <option value="">{t('allTypes')}</option>
              {options.type.map((value) => (
                <option key={value} value={value}>
                  {types(value as Parameters<typeof types>[0])}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('city')}
            <Select value={selected.ville} onChange={(e) => update('ville', e.target.value)} id="filtre-ville">
              <option value="">{t('allCities')}</option>
              {options.ville.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('year')}
            <Select value={selected.annee} onChange={(e) => update('annee', e.target.value)} id="filtre-annee">
              <option value="">{t('allYears')}</option>
              {options.annee.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </fieldset>

      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        {/* Annoncé aux lecteurs d'écran à chaque changement de filtre */}
        <p className="font-mono text-sm" aria-live="polite">
          {t('count', { count: visible.length })}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => replaceQuery(new URLSearchParams())}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            <X className="size-4" aria-hidden />
            {t('reset')}
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id}>{cards[p.id]}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-line p-8 text-center text-muted">{t('empty')}</p>
      )}
    </div>
  )
}
