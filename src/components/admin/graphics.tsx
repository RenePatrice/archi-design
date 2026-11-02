/**
 * Identité visuelle du back-office : monogramme (barre de navigation) et logo (page de connexion).
 * Même dessin que le logotype du site (components/layout/wordmark.tsx).
 */

function Monogram({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect width="32" height="32" rx="6" fill="#B4602A" />
      <path d="M7 24 L13 8 h2 L21 24 h-3.2 l-1.4-4 h-5.8 l-1.4 4 Z M11.6 17.4 h3.8 L13.5 12 Z" fill="#fff" />
      <path d="M22 8 h1 a7 8 0 0 1 0 16 h-1 Z M24.5 11.2 a4 4.8 0 0 1 0 9.6 Z" fill="#E8C08F" fillRule="evenodd" />
    </svg>
  )
}

export function AdminIcon() {
  return <Monogram size={28} />
}

export function AdminLogo() {
  return (
    <span className="ad-logo">
      <Monogram size={48} />
      <span className="ad-logo__text">
        <span className="ad-logo__name">ARCHI-DESIGN</span>
        <span className="ad-logo__sub">Back-office · Guinée</span>
      </span>
    </span>
  )
}
