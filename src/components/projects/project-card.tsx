import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/card'
import { MediaImage } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Pole, Project } from '@/payload-types'

/** Carte de projet : image, pôle, titre, ville et année. Toute la carte est cliquable. */
export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  const t = useTranslations('ProjectTypes')
  const pole = typeof project.pole === 'object' ? (project.pole as Pole) : null

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-sunken">
        <MediaImage
          media={project.coverImage}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {pole && <Badge tone={pole.tone ?? 'accent'}>{pole.title}</Badge>}
        <Badge>{t(project.type)}</Badge>
      </div>
      <h3 className="text-xl font-bold">
        {/* Le lien couvre toute la carte grâce au pseudo-élément ::after */}
        <Link href={`/realisations/${project.slug}`} className="after:absolute after:inset-0 hover:text-accent">
          {project.title}
        </Link>
      </h3>
      <p className="font-mono text-sm text-muted">
        {project.city} · {project.year}
        {project.surface ? ` · ${project.surface} m²` : ''}
      </p>
    </article>
  )
}
