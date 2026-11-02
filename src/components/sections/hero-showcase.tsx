'use client'

import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { MediaImage } from '@/components/ui/media-image'
import { BlueprintFacade, RotatingBadge } from '@/components/ui/ornaments'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

export type HeroInfoSlide = {
  key: string
  /** Libellé court de l'onglet (Architecture, Formation…) */
  tab: string
  eyebrow: string
  /** Titre : les lignes sont séparées par « | », un mot entre *astérisques* passe en italique */
  title: string
  text: string
  cta: { label: string; href: string }
  stat: { value: string; label: string }
  image: Media | number | null | undefined
}

const DURATION = 6500

/** Découpe « Bâtir *durable*|en Guinée » en lignes, avec les mots en italique. */
function TitleLines({ title }: { title: string }) {
  return (
    <>
      {title.split('|').map((line, i, lines) => (
        <span key={i} className="mask-line">
          <span style={{ animationDelay: `${120 + i * 110}ms` }}>
            {line.split(/(\*[^*]+\*)/).map((part, j) =>
              part.startsWith('*') ? (
                <em key={j} className="text-accent italic">
                  {part.slice(1, -1)}
                </em>
              ) : (
                part
              ),
            )}
            {/* Espace entre les lignes : le titre se lit d'un seul tenant (lecteurs d'écran, moteurs) */}
            {i < lines.length - 1 && ' '}
          </span>
        </span>
      ))}
    </>
  )
}

/**
 * Héros de l'accueil : un diaporama d'informations (pôles, formation, boutique, simulateur).
 * Le texte change avec une montée masquée, l'image dans une arche en fondu enchaîné,
 * un chiffre clé flotte sur l'image. Avance automatique, mise en pause au survol et au focus,
 * désactivée si le visiteur demande moins d'animations.
 */
export function HeroShowcase({
  slides,
  ticker,
  labels,
}: {
  slides: HeroInfoSlide[]
  ticker: string[]
  labels: { badge: string; secondary: { label: string; href: string }; slides: string }
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const go = useCallback((i: number) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => go(index + 1), DURATION)
    return () => window.clearTimeout(timer)
  }, [index, paused, count, go])

  const slide = slides[index]
  if (!slide) return null

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Fond : trame de points et grands cercles de construction */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" aria-hidden />

      <div className="container-site relative grid items-center gap-12 pt-10 pb-14 sm:pt-14 lg:grid-cols-12 lg:gap-8 lg:pt-16 lg:pb-20">
        {/* Texte du diapo : remonté à chaque changement (clé) pour rejouer l'animation */}
        <div key={slide.key} className="flex flex-col gap-7 lg:col-span-6" aria-live="polite">
          <p className="eyebrow fade-up">{slide.eyebrow}</p>
          <h1 className="font-display text-[2.6rem] leading-[1.02] sm:text-6xl xl:text-[4.75rem]">
            <TitleLines title={slide.title} />
          </h1>
          <p className="fade-up max-w-[50ch] text-lg leading-relaxed text-muted" style={{ animationDelay: '320ms' }}>
            {slide.text}
          </p>
          <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay: '420ms' }}>
            <Link href={slide.cta.href} className={buttonVariants({ size: 'lg' })}>
              {slide.cta.label}
              <ArrowRight aria-hidden />
            </Link>
            <Link href={labels.secondary.href} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              {labels.secondary.label}
            </Link>
          </div>
        </div>

        {/* Visuel : arche, dessin au trait, chiffre flottant, badge tournant */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-md lg:col-span-5 lg:col-start-8 lg:max-w-none">
          <div className="absolute -top-6 -right-4 bottom-10 left-10 rounded-t-full bg-accent/10" aria-hidden />
          <div className="relative aspect-[4/5] max-h-[560px] w-full overflow-hidden rounded-t-full bg-surface-sunken shadow-[0_40px_80px_-30px_rgba(18,17,16,0.45)]">
            {slides.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  'absolute inset-0 transition-[opacity,transform] duration-[1.4s] ease-expo',
                  i === index ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
                )}
                aria-hidden={i !== index}
              >
                <MediaImage media={s.image} sizes="(min-width: 1024px) 38vw, 90vw" priority={i === 0} />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden />
          </div>

          <BlueprintFacade className="pointer-events-none absolute -right-8 -bottom-10 hidden w-56 text-ink/60 sm:block" />

          <div
            key={`stat-${slide.key}`}
            className="fade-up absolute bottom-10 -left-4 flex flex-col gap-0.5 border border-line bg-bg/90 px-5 py-4 shadow-xl backdrop-blur-md sm:-left-12"
            style={{ animationDelay: '500ms' }}
          >
            <span className="font-display text-4xl leading-none text-accent">{slide.stat.value}</span>
            <span className="text-[0.625rem] font-semibold tracking-[0.2em] text-muted uppercase">{slide.stat.label}</span>
          </div>

          <RotatingBadge text={labels.badge} className="absolute -top-6 right-0 hidden text-ink sm:inline-flex">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-ink">
              <ArrowRight className="size-5 -rotate-45" aria-hidden />
            </span>
          </RotatingBadge>
        </div>

        {/* Onglets du diaporama, avec barre de progression */}
        <div role="tablist" aria-label={labels.slides} className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:col-span-12 lg:grid-cols-5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => go(i)}
              className="group flex flex-col gap-2 pt-3 text-left"
            >
              <span className="relative h-px w-full bg-line">
                <span
                  key={i === index ? `on-${index}-${paused}` : 'off'}
                  className={cn('absolute inset-y-0 left-0 bg-accent', i === index ? (paused ? 'w-full' : 'hero-progress') : 'w-0')}
                  style={{ animationDuration: `${DURATION}ms` }}
                />
              </span>
              <span className="flex items-baseline gap-2 text-xs font-semibold tracking-[0.16em] uppercase">
                <span className={cn('tabular-nums transition-colors', i === index ? 'text-accent' : 'text-muted')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={cn('transition-colors', i === index ? 'text-ink' : 'text-muted group-hover:text-ink')}>{s.tab}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bandeau d'informations défilant */}
      <div className="overflow-hidden border-y border-line bg-forge py-4 text-kaolin">
        <ul className="marquee flex w-max items-center gap-10 pr-10 text-xs font-semibold tracking-[0.24em] uppercase">
          {[...ticker, ...ticker].map((item, i) => (
            <li key={i} aria-hidden={i >= ticker.length} className="flex items-center gap-10 whitespace-nowrap">
              {item}
              <span className="text-sable">✦</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
