import { cn } from '@/lib/utils'

/**
 * Logotype provisoire, en attendant le logo officiel :
 * un monogramme au trait et le nom en capitales espacées, à la manière des studios d'architecture.
 * Pour le remplacer, il suffira de changer ce composant.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden>
        <rect x="0.75" y="0.75" width="30.5" height="30.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 24 L13 8 h2 L21 24 h-3.2 l-1.4-4 h-5.8 l-1.4 4 Z M11.6 17.4 h3.8 L13.5 12 Z" fill="currentColor" />
        <path d="M22 8 h1 a7 8 0 0 1 0 16 h-1 Z M24.5 11.2 a4 4.8 0 0 1 0 9.6 Z" fill="var(--accent)" fillRule="evenodd" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[0.9375rem] font-semibold tracking-[0.32em] whitespace-nowrap">ARCHI·DESIGN</span>
        <span className="mt-1 text-[0.5625rem] font-medium tracking-[0.5em] text-muted uppercase">Guinée</span>
      </span>
    </span>
  )
}
