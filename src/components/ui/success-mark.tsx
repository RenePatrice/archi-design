/** Coche de confirmation qui se dessine (cercle puis trait), après l'envoi d'un formulaire. */
export function SuccessMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={`draw draw-now size-16 text-success ${className ?? ''}`} aria-hidden>
      <circle pathLength={1} cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="2" />
      <path pathLength={1} d="M20 33 L28 41 L45 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
