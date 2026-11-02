import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Pole, Project } from '@/payload-types'

/**
 * Carte de projet, façon studio : grande image, filet, titre en serif, légende en capitales.
 * Toute la carte est cliquable. `size="large"` pour la carte principale d'une grille éditoriale.
 */
export function ProjectCard({
  project,
  priority,
  size = 'default',
  className,
}: {
  project: Project
  priority?: boolean
  size?: 'default' | 'large'
  className?: string
}) {
  const t = useTranslations('ProjectTypes')
  const pole = typeof project.pole === 'object' ? (project.pole as Pole) : null

  return (
    <article className={cn('group relative flex flex-col gap-5', className)}>
      <div
        className={cn(
          'relative overflow-hidden bg-surface-sunken',
          size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/3]',
        )}
      >
        <MediaImage
          media={project.coverImage}
          sizes={size === 'large' ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
          priority={priority}
          className="transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-5 bottom-5 flex size-12 translate-y-3 items-center justify-center bg-white text-forge opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <p className="text-[0.625rem] font-semibold tracking-[0.22em] text-muted uppercase">
          {[pole?.title, t(project.type)].filter(Boolean).join(' · ')}
        </p>
        <h3 className={cn('font-display', size === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[1.75rem]')}>
          {/* Le lien couvre toute la carte grâce au pseudo-élément ::after */}
          <Link href={`/realisations/${project.slug}`} className="transition-colors after:absolute after:inset-0 group-hover:text-accent">
            {project.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">
          {project.city} — {project.year}
          {project.surface ? ` · ${project.surface} m²` : ''}
        </p>
      </div>
    </article>
  )
}
