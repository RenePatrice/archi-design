import { cn } from '@/lib/utils'

/**
 * Logotype provisoire, en attendant le logo officiel :
 * un monogramme en latérite et le nom en Archivo élargi.
 * Pour le remplacer, il suffira de changer ce composant.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="3" fill="var(--laterite)" />
        <path d="M7 24 L13 8 h2 L21 24 h-3.2 l-1.4-4 h-5.8 l-1.4 4 Z M11.6 17.4 h3.8 L13.5 12 Z" fill="#fff" />
        <path d="M22 8 h1 a7 8 0 0 1 0 16 h-1 Z M24.5 11.2 a4 4.8 0 0 1 0 9.6 Z" fill="var(--sable)" fillRule="evenodd" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-extrabold tracking-tight whitespace-nowrap [font-stretch:120%]">
          ARCHI-DESIGN
        </span>
        <span className="font-mono text-[0.625rem] tracking-[0.2em] text-muted uppercase">Guinée</span>
      </span>
    </span>
  )
}
