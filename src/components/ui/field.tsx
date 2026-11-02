import { AlertCircle } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

/*
 * Champs de formulaire du design system.
 * Chaque champ est relié à son libellé, son aide et son erreur pour les lecteurs d'écran.
 * Les cases à cocher, listes de choix et envois de fichiers sont habillés dans globals.css (.form-ui).
 */

const controlClasses =
  'w-full min-h-13 border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-muted/70 shadow-[inset_0_1px_2px_rgba(18,17,16,0.04)] transition-[border-color,box-shadow,background-color] duration-300 ease-expo hover:border-muted/60 focus-visible:border-ink focus-visible:bg-bg focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_16%,transparent)] focus-visible:outline-none aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[0_0_0_4px_color-mix(in_srgb,var(--danger)_12%,transparent)]'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, className)} {...props} />
}

export function Textarea({ className, rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlClasses, 'min-h-32 resize-y leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClasses, 'select-ui cursor-pointer appearance-none pr-12', className)} {...props}>
      {children}
    </select>
  )
}

type FieldProps = {
  id: string
  label: string
  /** Texte d'aide affiché sous le libellé */
  hint?: string
  error?: string
  required?: boolean
  /** Libellé « Obligatoire » traduit, fourni par la page */
  requiredLabel?: string
  className?: string
  children: (aria: {
    id: string
    'aria-describedby'?: string
    'aria-invalid'?: boolean
    required?: boolean
  }) => React.ReactNode
}

/** Regroupe libellé, aide, contrôle et message d'erreur. */
export function Field({ id, label, hint, error, required, requiredLabel, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('group/field flex flex-col gap-2', className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-[0.6875rem] font-semibold tracking-[0.16em] uppercase transition-colors group-focus-within/field:text-accent"
      >
        {label}
        {required && (
          <span className="text-accent" aria-hidden>
            *
          </span>
        )}
        {required && requiredLabel && <span className="sr-only">{requiredLabel}</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="fade-up flex items-center gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
