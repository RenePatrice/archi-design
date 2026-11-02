import * as React from 'react'

import { cn } from '@/lib/utils'

/*
 * Champs de formulaire du design system.
 * Chaque champ est relié à son libellé, son aide et son erreur pour les lecteurs d'écran.
 */

const controlClasses =
  'w-full min-h-11 rounded-md border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted/80 transition-colors hover:border-muted focus-visible:border-focus aria-[invalid=true]:border-danger'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, className)} {...props} />
}

export function Textarea({ className, rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlClasses, 'resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClasses, 'appearance-auto pr-8', className)} {...props}>
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
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-semibold">
        {label}
        {required && requiredLabel && <span className="text-xs font-normal text-muted">{requiredLabel}</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {error && (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
