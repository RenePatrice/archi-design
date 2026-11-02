import sharp from 'sharp'

/**
 * Visuels provisoires générés aux couleurs de la charte, en attendant les vraies photos.
 * Chaque image dessine une façade stylisée (volumes, baies, brise-soleil) différente selon
 * le numéro, avec la mention « Visuel de démonstration ».
 */
const palettes = [
  { sky: '#E0A46A', ground: '#A0521E', wall: '#F2F1EC', accent: '#1F4A3A' },
  { sky: '#24305E', ground: '#1C1E1D', wall: '#E0A46A', accent: '#F2F1EC' },
  { sky: '#F2F1EC', ground: '#1F4A3A', wall: '#A0521E', accent: '#24305E' },
  { sky: '#1F4A3A', ground: '#1C1E1D', wall: '#F2F1EC', accent: '#E0A46A' },
]

/** Générateur pseudo-aléatoire reproductible : la même graine donne toujours la même image. */
function random(seed: number) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function facadeSvg(seed: number, label: string, width = 1600, height = 1200) {
  const r = random(seed)
  const p = palettes[seed % palettes.length]
  const groundY = height * 0.78
  const parts: string[] = []

  // Volumes du bâtiment
  let x = width * (0.08 + r() * 0.08)
  while (x < width * 0.88) {
    const w = width * (0.16 + r() * 0.2)
    const h = height * (0.22 + r() * 0.38)
    const y = groundY - h
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.wall}"/>`)
    // Baies vitrées
    const cols = 2 + Math.floor(r() * 3)
    const rows = Math.max(1, Math.floor(h / 170))
    for (let c = 0; c < cols; c++) {
      for (let row = 0; row < rows; row++) {
        const bw = (w / cols) * 0.55
        const bh = (h / rows) * 0.5
        const bx = x + (w / cols) * c + (w / cols - bw) / 2
        const by = y + (h / rows) * row + (h / rows - bh) / 2
        parts.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${p.accent}" opacity="0.85"/>`)
      }
    }
    // Brise-soleil horizontaux (architecture bioclimatique)
    if (r() > 0.4) {
      for (let k = 0; k < 6; k++) {
        parts.push(`<rect x="${x - 10}" y="${y + 20 + k * 22}" width="${w + 20}" height="6" fill="${p.ground}" opacity="0.6"/>`)
      }
    }
    x += w + width * (0.01 + r() * 0.04)
  }

  // Végétation ronde, motif léger
  for (let k = 0; k < 4; k++) {
    const cx = width * r()
    parts.push(`<circle cx="${cx}" cy="${groundY - 30}" r="${50 + r() * 50}" fill="${p.accent}" opacity="0.5"/>`)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${p.sky}"/>
  <circle cx="${width * (0.7 + r() * 0.2)}" cy="${height * 0.2}" r="90" fill="${p.wall}" opacity="0.35"/>
  ${parts.join('\n  ')}
  <rect y="${groundY}" width="${width}" height="${height - groundY}" fill="${p.ground}"/>
  <rect x="40" y="${height - 110}" width="${Math.min(width - 80, 40 + label.length * 22)}" height="70" fill="#1C1E1D" opacity="0.75"/>
  <text x="64" y="${height - 64}" font-family="Arial, sans-serif" font-size="32" fill="#F2F1EC">${label}</text>
</svg>`
}

/** Renvoie un fichier image WebP prêt à être envoyé dans la médiathèque Payload. */
export async function demoImage(seed: number, name: string) {
  const svg = facadeSvg(seed, 'Visuel de démonstration')
  const data = await sharp(Buffer.from(svg)).webp({ quality: 78 }).toBuffer()
  return { data, mimetype: 'image/webp', name: `${name}.webp`, size: data.length }
}
