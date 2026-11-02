import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Bouton du design system : rectangle net, capitales espacées. Hauteur minimale de 44 px pour le tactile.
 * Variantes :
 *   primary   terre cuite, pour l'action principale (« Demander un devis »)
 *   secondary encre, pour les actions institutionnelles
 *   outline   contour, action secondaire
 *   ghost     sans fond, navigation et icônes
 */
const variants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2.5 font-semibold whitespace-nowrap transition-[background-color,border-color,color,gap] duration-300 hover:gap-3.5 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
        secondary: 'bg-deep text-deep-ink hover:opacity-90',
        outline: 'border border-ink/35 text-ink hover:border-ink hover:bg-ink hover:text-bg',
        ghost: 'text-ink hover:bg-surface-sunken',
      },
      size: {
        sm: 'px-4 text-[0.6875rem] tracking-[0.18em] uppercase',
        md: 'px-6 text-xs tracking-[0.18em] uppercase',
        lg: 'px-8 text-xs tracking-[0.2em] uppercase min-h-14',
        icon: 'size-11',
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
