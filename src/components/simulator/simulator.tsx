'use client'

import { Download } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { RequestForm } from '@/components/forms/request-form'
import { buttonVariants } from '@/components/ui/button'
import { Select } from '@/components/ui/field'
import { formatGNF } from '@/lib/requests/print-pricing'
import { SIM_FINISHES, SIM_PROJECT_TYPES, SIM_ZONES, simulate, type SimulatorPricing } from '@/lib/simulator/estimate'
import { cn } from '@/lib/utils'

type Props = { pricing: SimulatorPricing; whatsappNumber: string | null; privacySlug: string | null }

/**
 * Simulateur de projet : chaque choix met à jour la fourchette de coût et de délai.
 * Le même calcul est refait par le serveur pour le PDF et la demande envoyée à l'équipe.
 */
export function Simulator({ pricing, whatsappNumber, privacySlug }: Props) {
  const t = useTranslations('Simulator')
  const locale = useLocale()
  const availableTypes = SIM_PROJECT_TYPES.filter((key) => pricing.types.some((p) => p.key === key))
  const [type, setType] = useState<string>(availableTypes[0] ?? 'villa')
  const [surface, setSurface] = useState(150)
  const [finish, setFinish] = useState<string>('standard')
  const [zone, setZone] = useState<string>('conakry')

  const typeRow = pricing.types.find((p) => p.key === type)
  const minSurface = typeRow?.minSurface ?? 10
  const maxSurface = typeRow?.maxSurface ?? 5000
  const result = simulate(pricing, { type, surface, finish, zone })
  const money = (n: number) => formatGNF(n, locale)
  const pdfHref = `/pdf/pre-devis?${new URLSearchParams({ lang: locale, type, surface: String(surface), finish, zone })}`

  return (
    <div className="flex flex-col gap-14">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        {/* ───── Choix ───── */}
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-semibold">{t('type')}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableTypes.map((key) => (
                <label
                  key={key}
                  className={cn(
                    'flex min-h-14 cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus',
                    type === key ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface hover:border-ink/40',
                  )}
                >
                  <input type="radio" name="sim-type" value={key} checked={type === key} onChange={() => setType(key)} className="sr-only" />
                  {t(`types.${key}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="sim-surface" className="font-semibold">
                {t('surface')}
              </label>
              <span className="flex items-baseline gap-1.5">
                <input
                  id="sim-surface-nombre"
                  type="number"
                  inputMode="numeric"
                  min={minSurface}
                  max={maxSurface}
                  value={surface}
                  onChange={(e) => setSurface(Number(e.target.value))}
                  aria-label={`${t('surface')} (${t('surfaceUnit')})`}
                  className="h-11 w-24 rounded-md border border-line bg-surface px-2 text-right font-mono text-lg tabular-nums"
                />
                <span className="text-muted">{t('surfaceUnit')}</span>
              </span>
            </div>
            <input
              id="sim-surface"
              type="range"
              min={minSurface}
              max={Math.min(maxSurface, 2000)}
              step={5}
              value={Math.min(surface, 2000)}
              onChange={(e) => setSurface(Number(e.target.value))}
              className="h-11 w-full cursor-pointer accent-[var(--accent)]"
            />
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-semibold">{t('finish')}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {SIM_FINISHES.map((key) => (
                <label
                  key={key}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 rounded-md border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus',
                    finish === key ? 'border-deep bg-deep text-deep-ink' : 'border-line bg-surface hover:border-ink/40',
                  )}
                >
                  <input type="radio" name="sim-finish" value={key} checked={finish === key} onChange={() => setFinish(key)} className="sr-only" />
                  <span className="font-semibold">{t(`finishes.${key}`)}</span>
                  <span className={cn('text-xs', finish === key ? 'opacity-85' : 'text-muted')}>{t(`finishHints.${key}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="sim-zone" className="font-semibold">
              {t('zone')}
            </label>
            <Select id="sim-zone" value={zone} onChange={(e) => setZone(e.target.value)}>
              {SIM_ZONES.filter((key) => pricing.zones.some((z) => z.key === key)).map((key) => (
                <option key={key} value={key}>
                  {t(`zones.${key}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* ───── Résultat, façon cartouche de plan ───── */}
        <section aria-labelledby="sim-resultat" className="flex flex-col overflow-hidden rounded-md border border-line bg-surface lg:sticky lg:top-24">
          <h2 id="sim-resultat" className="border-b border-line px-5 py-3 font-mono text-xs tracking-[0.12em] uppercase [font-stretch:100%]">
            {t('result')}
          </h2>
          <div aria-live="polite" className="flex flex-col gap-6 p-5">
            {result.ok ? (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted">{t('budget')}</p>
                  <p className="font-display text-2xl leading-tight font-extrabold tabular-nums [font-stretch:112%] sm:text-3xl" data-testid="sim-budget">
                    {money(result.costMin)}
                    <span className="text-muted"> – </span>
                    {money(result.costMax)}
                  </p>
                  <p className="font-mono text-xs text-muted">{t('perM2', { min: money(result.pricePerM2Min), max: money(result.pricePerM2Max) })}</p>
                  <p className="text-xs text-muted">{t('budgetHint')}</p>
                </div>
                <div className="flex flex-col gap-1 border-t border-line pt-5">
                  <p className="text-sm text-muted">{t('duration')}</p>
                  <p className="font-display text-2xl font-extrabold tabular-nums [font-stretch:112%]" data-testid="sim-duree">
                    {t('months', { min: result.monthsMin, max: result.monthsMax })}
                  </p>
                  <p className="text-xs text-muted">{t('durationHint')}</p>
                </div>
                <a href={pdfHref} download className={buttonVariants({ variant: 'secondary' })}>
                  <Download aria-hidden />
                  {t('download')}
                </a>
              </>
            ) : (
              <p role="alert" className="text-sm text-danger">
                {result.reason === 'surface' ? t('surfaceError', { min: result.minSurface ?? minSurface, max: result.maxSurface ?? maxSurface }) : '—'}
              </p>
            )}
            <p className="text-xs text-muted">{t('disclaimer')}</p>
          </div>
        </section>
      </div>

      {/* ───── Envoi à l'équipe ───── */}
      <section aria-labelledby="sim-envoi" className="flex max-w-3xl flex-col gap-4 border-t border-line pt-10">
        <h2 id="sim-envoi" className="text-2xl font-bold">
          {t('sendTitle')}
        </h2>
        <p className="text-muted">{t('sendIntro')}</p>
        <RequestForm service="simulateur" whatsappNumber={whatsappNumber} privacySlug={privacySlug} disabled={!result.ok}>
          {/* Les choix du simulateur partent avec le formulaire ; le serveur refait le calcul */}
          <input type="hidden" name="simType" value={type} />
          <input type="hidden" name="simSurface" value={surface} />
          <input type="hidden" name="simFinish" value={finish} />
          <input type="hidden" name="simZone" value={zone} />
        </RequestForm>
      </section>
    </div>
  )
}
