/**
 * Recoloration d'un mur sur une photo, entièrement dans le navigateur.
 * 1. Remplissage de proche en proche depuis le point touché (pixels de couleur voisine)
 * 2. Nouvelle teinte appliquée en gardant les variations de lumière d'origine
 *    (ombres, texture de l'enduit), pour un rendu crédible.
 */

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Luminance perçue (0–255). */
const luminance = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b

/**
 * Sélectionne la zone continue autour de (x, y) dont la couleur reste proche du point de départ.
 * `tolerance` : écart RVB toléré (0–255). Renvoie un masque (1 = dans la zone).
 */
export function floodFillMask(image: ImageData, x: number, y: number, tolerance: number): Uint8Array {
  const { width, height, data } = image
  const mask = new Uint8Array(width * height)
  const start = (y * width + x) * 4
  const [r0, g0, b0] = [data[start], data[start + 1], data[start + 2]]
  const limit = tolerance * tolerance * 3
  const stack = [y * width + x]

  while (stack.length) {
    const index = stack.pop()!
    if (mask[index]) continue
    const p = index * 4
    const dr = data[p] - r0
    const dg = data[p + 1] - g0
    const db = data[p + 2] - b0
    if (dr * dr + dg * dg + db * db > limit) continue
    mask[index] = 1
    const px = index % width
    if (px > 0) stack.push(index - 1)
    if (px < width - 1) stack.push(index + 1)
    if (index >= width) stack.push(index - width)
    if (index < width * (height - 1)) stack.push(index + width)
  }
  return mask
}

/** Applique la teinte `hex` aux pixels du masque, en conservant ombres et lumières. */
export function recolor(image: ImageData, mask: Uint8Array, hex: string): ImageData {
  const out = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height)
  const [tr, tg, tb] = hexToRgb(hex)

  // Luminance moyenne de la zone : référence pour garder les écarts (ombres, reliefs)
  let sum = 0
  let count = 0
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue
    const p = i * 4
    sum += luminance(image.data[p], image.data[p + 1], image.data[p + 2])
    count++
  }
  if (!count) return out
  const mean = sum / count || 1

  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue
    const p = i * 4
    const lum = luminance(image.data[p], image.data[p + 1], image.data[p + 2])
    // Rapport de lumière local, atténué pour ne pas « brûler » les teintes claires
    const factor = 1 + ((lum - mean) / mean) * 0.85
    const scale = Math.max(0.15, factor)
    out.data[p] = tr * scale
    out.data[p + 1] = tg * scale
    out.data[p + 2] = tb * scale
  }
  return out
}
