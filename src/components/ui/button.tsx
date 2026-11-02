import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Bouton du design system. Hauteur minimale de 44 px pour le tactile.
 * Variantes :
 *   primary   latérite, pour l'action principale (« Demander un devis »)
 *   secondary vert Fouta, pour les actions institutionnelles
 *   outline   contour, action secondaire
 *   ghost     sans fond, navigation et icônes
 */
const variants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
        secondary: 'bg-deep text-deep-ink hover:opacity-90',
        outline: 'border border-ink/30 text-ink hover:border-ink hover:bg-surface',
        ghost: 'text-ink hover:bg-surface-sunken',
      },
      size: {
        sm: 'px-3 text-sm rounded-md',
        md: 'px-5 text-base rounded-md',
        lg: 'px-7 text-lg rounded-md min-h-13',
        icon: 'size-11 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

/** Classes d'un bouton (aussi pour un lien stylé en bouton). Les classes ajoutées remplacent celles par défaut. */
export const buttonVariants = (props?: Parameters<typeof variants>[0]) => cn(variants(props))

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof variants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
