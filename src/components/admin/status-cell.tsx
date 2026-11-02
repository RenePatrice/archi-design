'use client'

import { getTranslation } from '@payloadcms/translations'
import { useTranslation } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'

/**
 * Statut affiché en pastille de couleur dans les listes du back-office (couleur + libellé).
 * Les couleurs sont définies dans app/(payload)/custom.scss (classes ad-pill--…).
 */
export function StatusCell({ cellData, field }: DefaultCellComponentProps) {
  const { i18n } = useTranslation()
  if (!cellData) return null
  const value = String(cellData)
  const option = 'options' in field ? field.options?.find((o) => (typeof o === 'string' ? o : o.value) === value) : undefined
  const raw = option && typeof option === 'object' ? option.label : value
  const label = getTranslation(raw as Parameters<typeof getTranslation>[0], i18n)
  return <span className={`ad-pill ad-pill--${value}`}>{label}</span>
}
