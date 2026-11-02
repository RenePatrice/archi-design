/**
 * Pièces types dessinées en SVG. Chaque zone peignable reçoit sa couleur ; des dégradés
 * d'ombre et de lumière posés par-dessus donnent du volume quelle que soit la teinte.
 */

export type RoomKind = 'salon' | 'chambre' | 'facade'
export type Surface = 'walls' | 'accent' | 'facade' | 'trim'

export const ROOM_SURFACES: Record<RoomKind, Surface[]> = {
  salon: ['walls', 'accent'],
  chambre: ['walls', 'accent'],
  facade: ['facade', 'trim'],
}

const shading = (
  <defs>
    <linearGradient id="ombre-gauche" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor="#000" stopOpacity="0.28" />
      <stop offset="1" stopColor="#000" stopOpacity="0.08" />
    </linearGradient>
    <linearGradient id="lumiere-fond" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
      <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.1" />
    </linearGradient>
    <linearGradient id="soleil" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
      <stop offset="1" stopColor="#000" stopOpacity="0.12" />
    </linearGradient>
  </defs>
)

export function RoomScene({ kind, colors, label }: { kind: RoomKind; colors: Partial<Record<Surface, string>>; label: string }) {
  const c = (s: Surface, fallback: string) => colors[s] ?? fallback

  if (kind === 'facade') {
    return (
      <svg viewBox="0 0 800 560" role="img" aria-label={label} className="h-auto w-full">
        {shading}
        <rect width="800" height="560" fill="#BFD9E8" />
        <rect y="430" width="800" height="130" fill="#A57A55" />
        <rect y="430" width="800" height="14" fill="#8A6343" />
        {/* Toit débordant (protection solaire) */}
        <path d="M90 170 L400 70 L710 170 Z" fill="#6B3A1C" />
        <rect x="70" y="165" width="660" height="18" fill="#57301A" />
        {/* Façade */}
        <rect x="120" y="183" width="560" height="250" fill={c('facade', '#F2F1EC')} />
        <rect x="120" y="183" width="560" height="250" fill="url(#soleil)" />
        <rect x="120" y="183" width="560" height="22" fill="#000" opacity="0.12" />
        {/* Encadrements et ouvertures */}
        {[170, 520].map((x) => (
          <g key={x}>
            <rect x={x - 10} y="230" width="130" height="120" fill={c('trim', '#A0521E')} />
            <rect x={x} y="240" width="110" height="100" fill="#2B3A44" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={x} y={244 + i * 16} width="110" height="6" fill={c('trim', '#A0521E')} opacity="0.9" />
            ))}
          </g>
        ))}
        <rect x="350" y="250" width="100" height="183" fill={c('trim', '#A0521E')} />
        <rect x="362" y="262" width="76" height="171" fill="#5A3A22" />
        <circle cx="425" cy="350" r="4" fill="#E0A46A" />
        {/* Végétation */}
        <circle cx="90" cy="420" r="45" fill="#3E6B4F" />
        <circle cx="725" cy="415" r="55" fill="#2F5A40" />
      </svg>
    )
  }

  const isBedroom = kind === 'chambre'
  return (
    <svg viewBox="0 0 800 560" role="img" aria-label={label} className="h-auto w-full">
      {shading}
      {/* Mur du fond */}
      <polygon points="180,40 800,40 800,420 180,420" fill={c('walls', '#F2F1EC')} />
      <polygon points="180,40 800,40 800,420 180,420" fill="url(#lumiere-fond)" />
      {/* Mur de gauche, en perspective */}
      <polygon points="0,0 180,40 180,420 0,560" fill={c(isBedroom ? 'walls' : 'accent', isBedroom ? '#F2F1EC' : '#24305E')} />
      <polygon points="0,0 180,40 180,420 0,560" fill="url(#ombre-gauche)" />
      {/* Mur d'accent (pan derrière le meuble principal) */}
      <rect x={isBedroom ? 300 : 520} y="40" width={isBedroom ? 330 : 280} height="380" fill={c('accent', '#A0521E')} />
      <rect x={isBedroom ? 300 : 520} y="40" width={isBedroom ? 330 : 280} height="380" fill="url(#lumiere-fond)" />
      {/* Sol */}
      <polygon points="0,560 180,420 800,420 800,560" fill="#B98A5E" />
      <polygon points="0,560 180,420 800,420 800,560" fill="#000" opacity="0.08" />
      {/* Plinthe */}
      <rect x="180" y="410" width="620" height="10" fill="#fff" opacity="0.6" />
      {/* Fenêtre */}
      <rect x={isBedroom ? 670 : 250} y="110" width="110" height="160" fill="#CFE4F1" />
      <rect x={isBedroom ? 670 : 250} y="110" width="110" height="160" fill="none" stroke="#fff" strokeWidth="8" />
      <line x1={isBedroom ? 725 : 305} y1="110" x2={isBedroom ? 725 : 305} y2="270" stroke="#fff" strokeWidth="5" />
      {isBedroom ? (
        <g>
          {/* Lit et tête de lit */}
          <rect x="345" y="250" width="240" height="70" rx="6" fill="#5A3A22" />
          <rect x="320" y="315" width="290" height="70" rx="8" fill="#F7F4EC" />
          <rect x="320" y="365" width="290" height="40" rx="6" fill="#24305E" />
          <rect x="350" y="300" width="90" height="34" rx="10" fill="#E9E2D3" />
          <rect x="490" y="300" width="90" height="34" rx="10" fill="#E9E2D3" />
          <rect x="250" y="340" width="55" height="60" fill="#6B4A2E" />
          <circle cx="277" cy="318" r="18" fill="#E0A46A" />
        </g>
      ) : (
        <g>
          {/* Canapé, table basse, plante */}
          <rect x="545" y="300" width="230" height="80" rx="12" fill="#1F4A3A" />
          <rect x="545" y="270" width="230" height="45" rx="12" fill="#2A5A47" />
          <rect x="420" y="370" width="110" height="18" rx="4" fill="#6B4A2E" />
          <rect x="430" y="388" width="8" height="25" fill="#6B4A2E" />
          <rect x="512" y="388" width="8" height="25" fill="#6B4A2E" />
          <rect x="230" y="330" width="40" height="70" rx="4" fill="#A0521E" />
          <circle cx="250" cy="300" r="40" fill="#3E6B4F" />
          {/* Cadre calligraphié */}
          <rect x="360" y="150" width="120" height="90" fill="#F7F4EC" stroke="#1C1E1D" strokeWidth="4" />
          <path d="M380 205 Q405 170 430 200 T465 190" stroke="#1C1E1D" strokeWidth="4" fill="none" />
        </g>
      )}
    </svg>
  )
}
