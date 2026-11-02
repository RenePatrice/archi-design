'use client'

import { ArrowRight, Award, CalendarDays, Clock, Layers } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export type CourseSummary = {
  id: number
  slug: string
  title: string
  summary: string
  level: 'debutant' | 'intermediaire' | 'avance' | 'tous'
  duration: string
  modules: number
  certificate: boolean
  trainer: string | null
  price: string
  nextSession: string | null
  image: string | null
  imageAlt: string
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** Carte de formation, façon plateforme de cours en ligne. */
function CourseCard({ course }: { course: CourseSummary }) {
  const t = useTranslations('Training')
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-line bg-surface transition-[transform,box-shadow] duration-500 ease-expo hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(18,17,16,0.4)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-sunken">
        {course.image && (
          <Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-700 ease-expo group-hover:scale-105" />
        )}
        <span className="absolute top-3 left-3 bg-bg/90 px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
          {t(`levels.${course.level}`)}
        </span>
        {course.certificate && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-accent px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.18em] text-accent-ink uppercase">
            <Award className="size-3" aria-hidden />
            {t('certified')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="font-display text-2xl leading-tight">
          <Link href={`/formations/${course.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
            {course.title}
          </Link>
        </h3>
        {course.trainer && (
          <p className="flex items-center gap-2.5 text-sm">
            <span className="flex size-8 items-center justify-center rounded-full bg-forge text-[0.625rem] font-semibold text-kaolin" aria-hidden>
              {initials(course.trainer)}
            </span>
            <span className="text-muted">{course.trainer}</span>
          </p>
        )}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{course.summary}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {course.duration}
          </li>
          {course.modules > 0 && (
            <li className="flex items-center gap-1.5">
              <Layers className="size-3.5" aria-hidden />
              {t('modules', { count: course.modules })}
            </li>
          )}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <span className="flex flex-col gap-1">
            {course.nextSession && (
              <span className="flex items-center gap-1.5 text-[0.625rem] font-semibold tracking-[0.14em] text-success uppercase">
                <CalendarDays className="size-3.5" aria-hidden />
                {course.nextSession}
              </span>
            )}
            <span className="font-display text-2xl leading-none">{course.price}</span>
          </span>
          <span className="flex size-10 items-center justify-center rounded-full border border-line transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink" aria-hidden>
            <ArrowRight className="size-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
          </span>
        </div>
      </div>
    </article>
  )
}

/** Catalogue des formations avec filtre par niveau. */
export function CourseCatalog({ courses }: { courses: CourseSummary[] }) {
  const t = useTranslations('Training')
  const [level, setLevel] = useState('')
  const levels = (['debutant', 'intermediaire', 'avance', 'tous'] as const).filter((l) => courses.some((c) => c.level === l))
  const visible = level ? courses.filter((c) => c.level === level) : courses

  return (
    <div className="flex flex-col gap-8">
      {levels.length > 1 && (
        <div role="group" aria-label={t('level')} className="flex flex-wrap gap-2">
          {['', ...levels].map((l) => (
            <button
              key={l || 'tous-niveaux'}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={cn(
                'min-h-11 border px-4 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase transition-colors',
                level === l ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink/50',
              )}
            >
              {l ? t(`levels.${l}`) : t('allCourses')}
            </button>
          ))}
        </div>
      )}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((course, i) => (
          <li key={course.id} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
    </div>
  )
}
