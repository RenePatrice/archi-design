import { cn } from '@/lib/utils'

/*
 * Ornements SVG du site : dessins au trait d'architecte, motifs inspirés du leppi, badges.
 * Purement décoratifs (aria-hidden). Les classes « draw » les font se tracer à l'apparition
 * (voir globals.css) ; chaque tracé porte pathLength="1" pour que l'animation soit uniforme.
 */

/** Façade dessinée au trait, avec cotes : évoque le plan d'architecte. */
export function BlueprintFacade({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(animate && 'draw draw-now', className)}
      aria-hidden
    >
      {/* Sol et volumes */}
      <path pathLength={1} d="M10 210 H310" />
      <path pathLength={1} d="M40 210 V110 H150 V210" />
      <path pathLength={1} d="M150 210 V70 H270 V210" />
      {/* Double toiture bioclimatique */}
      <path pathLength={1} d="M30 110 L95 72 L160 110" />
      <path pathLength={1} d="M140 70 H280 M146 62 H274" />
      {/* Ouvertures */}
      <path pathLength={1} d="M62 135 h30 v30 h-30 Z M108 135 h26 v75" />
      <path pathLength={1} d="M172 95 h34 v40 h-34 Z M220 95 h34 v40 h-34 Z" />
      <path pathLength={1} d="M172 155 h34 v40 h-34 Z M220 155 h34 v55" />
      {/* Brise-soleil */}
      <path pathLength={1} d="M168 90 h42 M216 90 h42 M168 150 h42" />
      {/* Cotes */}
      <path pathLength={1} d="M40 226 H270 M40 221 v10 M150 221 v10 M270 221 v10" />
      <path pathLength={1} d="M290 70 V210 M285 70 h10 M285 210 h10" />
      <circle pathLength={1} cx="95" cy="40" r="14" />
    </svg>
  )
}

/** Texte disposé en cercle qui tourne lentement autour d'un pictogramme. */
export function RotatingBadge({ text, className, children }: { text: string; className?: string; children?: React.ReactNode }) {
  const id = `badge-${text.replace(/[^a-z0-9]/gi, '').slice(0, 24)}`
  return (
    <span className={cn('relative inline-flex size-32 items-center justify-center', className)} aria-hidden>
      <svg viewBox="0 0 120 120" className="spin-slow absolute inset-0 size-full">
        <defs>
          <path id={id} d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <text className="fill-current text-[9.5px] font-semibold tracking-[0.32em] uppercase">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      {children}
    </span>
  )
}

/** Bande de chevrons inspirée des tissus leppi du Fouta-Djalon. */
export function LeppiBand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 16" preserveAspectRatio="none" className={cn('h-4 w-full', className)} aria-hidden>
      <defs>
        <pattern id="leppi" width="24" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16 L6 8 L12 16 M12 16 L18 8 L24 16" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M0 0 L6 8 L12 0 M12 0 L18 8 L24 0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <circle cx="12" cy="8" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="240" height="16" fill="url(#leppi)" />
    </svg>
  )
}

/** Trait manuscrit sous un mot (titre, chiffre). */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" className={cn('draw', className)} aria-hidden>
      <path pathLength={1} d="M2 9 C 40 2, 70 13, 104 7 S 170 3, 198 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Rose des vents minimaliste (carte, contact). */
export function CompassMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden>
      <circle cx="32" cy="32" r="30" />
      <circle cx="32" cy="32" r="22" strokeDasharray="2 4" />
      <path d="M32 6 L37 32 L32 58 L27 32 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 6 L37 32 H27 Z" fill="currentColor" />
      <path d="M6 32 H58" />
      <text x="32" y="4" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" dy="-1">
        N
      </text>
    </svg>
  )
}

/** Arc d'architecte : grand cercle de construction derrière un visuel. */
export function ConstructionArcs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="0.75" className={cn('draw', className)} aria-hidden>
      <circle pathLength={1} cx="200" cy="200" r="190" />
      <circle pathLength={1} cx="200" cy="200" r="140" strokeDasharray="3 6" />
      <path pathLength={1} d="M10 200 H390 M200 10 V390" />
      <path pathLength={1} d="M66 66 L334 334 M334 66 L66 334" opacity="0.5" />
    </svg>
  )
}

/** Pictogrammes au trait pour les services (boutique, formations, garanties). */
export type LineIconName = 'truck' | 'palette' | 'shield' | 'cash' | 'cert' | 'tools' | 'users' | 'clock' | 'house' | 'brush' | 'pen' | 'print' | 'pencil' | 'handshake' | 'chat' | 'doc'

export function LineIcon({ name, className }: { name: LineIconName; className?: string }) {
  const paths: Record<LineIconName, string> = {
    truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01',
    palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7.5h.01M15 7.5h.01',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM8.5 12l2.5 2.5L16 9.5',
    cash: 'M3 7h18v10H3zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M6 10v4M18 10v4',
    cert: 'M5 4h14v11H5zM9 8h6M9 11h4M10 15l-1 6 3-2 3 2-1-6',
    tools: 'M14 6l4 4-9 9H5v-4zM16 4l4 4M4 20l3-3',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-3.9 3.1-6 7-6s7 2.1 7 6M17 3a4 4 0 0 1 0 8M22 21c0-3-1.6-5-4-5.7',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
    house: 'M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6',
    brush: 'M14 4l6 6-7 7-6-6zM7 11l-3 3c-1 1-1 3 0 4s3 1 4 0l3-3',
    pen: 'M4 20c3-1 5-3 7-6l6-9 2 1.5-6 9c-2 3-5 4.5-9 4.5zM13 8l3 2',
    print: 'M6 9V3h12v6M6 17H4v-7h16v7h-2M7 14h10v7H7z',
    pencil: 'M15 4l5 5L9 20H4v-5zM13 6l5 5',
    handshake: 'M3 12l4-4 4 2 3-2 3 1 4 3M7 8v6l4 4 2-2 2 2 2-2-6-6M3 12l4 3',
    chat: 'M4 5h16v11H9l-5 4z',
    doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={paths[name]} />
    </svg>
  )
}
