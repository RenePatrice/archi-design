import { cn } from '@/lib/utils'

/** Titre de section : petit sur-titre en capitales, titre, introduction facultative. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Tag = 'h2',
  id,
  className,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string | null
  as?: 'h1' | 'h2'
  id?: string
  className?: string
  /** Action alignée à droite sur grand écran (ex. « Toutes les réalisations ») */
  children?: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex max-w-3xl flex-col gap-3">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag
          id={id}
          className={cn(
            'font-extrabold tracking-tight',
            Tag === 'h1' ? 'text-4xl [font-stretch:118%] sm:text-5xl' : 'text-3xl sm:text-4xl',
          )}
        >
          {title}
        </Tag>
        {intro && <p className="max-w-[60ch] text-lg text-muted">{intro}</p>}
      </div>
      {children}
    </div>
  )
}
