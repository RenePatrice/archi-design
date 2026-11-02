import 'server-only'

import config from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'
import { formatGNF } from '@/lib/requests/print-pricing'
import { siteUrl } from '@/lib/seo'
import { getSiteSettings } from '@/lib/site-settings'

import { simulate, type SimulatorInput, type SimulatorPricing } from './estimate'
import { renderPreQuote } from './pdf'

/** Grille du simulateur lue en base, au format attendu par simulate(). */
export async function loadSimulatorPricing(): Promise<SimulatorPricing> {
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: 'simulator-pricing', depth: 0, overrideAccess: false })
  return {
    types: (global.types ?? []).map((t) => ({ ...t, minSurface: t.minSurface ?? null, maxSurface: t.maxSurface ?? null })),
    zones: (global.zones ?? []).map((z) => ({ key: z.key, coefficient: z.coefficient, extraMonths: z.extraMonths ?? 0 })),
  }
}

type Translator = (key: string, values?: Record<string, string | number>) => string

/**
 * Calcule l'estimation et produit le PDF de pré-devis dans la langue du visiteur.
 * Renvoie null si les paramètres ne permettent pas d'estimation (type inconnu, surface hors bornes).
 */
export async function buildPreQuotePdf(input: SimulatorInput, locale: Locale, options: { reference?: string; customerName?: string } = {}) {
  const pricing = await loadSimulatorPricing()
  const result = simulate(pricing, input)
  if (!result.ok) return null

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'Simulator' }) as unknown as Promise<Translator & { raw: (key: string) => unknown }>,
    getSiteSettings(locale),
  ])

  const now = new Date()
  const reference = options.reference ?? `SIM-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${String(now.getTime()).slice(-4)}`
  const stepsKey = input.type === 'renovation' ? 'renovation' : input.type === 'interieur' ? 'interieur' : 'construction'
  const money = (n: number) => formatGNF(n, locale)

  const pdf = await renderPreQuote({
    reference,
    dateText: new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'Africa/Conakry' }).format(now),
    labels: {
      eyebrow: t('pdf.eyebrow'),
      title: t('pdf.title'),
      subtitle: t('pdf.subtitle'),
      preparedFor: options.customerName ? t('pdf.preparedFor', { name: options.customerName }) : undefined,
      reference: t('pdf.reference'),
      date: t('pdf.date'),
      budget: t('budget'),
      budgetHint: t('budgetHint'),
      duration: t('duration'),
      durationHint: t('durationHint'),
      details: t('pdf.details'),
      steps: t('pdf.steps'),
      disclaimer: t('pdf.disclaimer'),
    },
    result,
    costText: `${money(result.costMin)} – ${money(result.costMax)}`,
    durationText: t('months', { min: result.monthsMin, max: result.monthsMax }),
    rows: [
      { label: t('type'), value: t(`types.${input.type}`) },
      { label: t('surface'), value: `${new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB').format(input.surface)} m²` },
      { label: t('finish'), value: t(`finishes.${input.finish}`) },
      { label: t('zone'), value: t(`zones.${input.zone}`) },
      { label: t('pdf.pricePerM2'), value: `${money(result.pricePerM2Min)} – ${money(result.pricePerM2Max)}` },
    ],
    steps: t.raw(`steps.${stepsKey}`) as string[],
    company: {
      name: settings.companyName,
      tagline: settings.tagline,
      contact: [settings.phone, settings.email].filter(Boolean).join(' · '),
      url: siteUrl.replace(/^https?:\/\//, ''),
    },
  })

  return { pdf, reference, result }
}
