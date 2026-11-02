import { describe, expect, it } from 'vitest'

import { floodFillMask, hexToRgb } from '@/lib/configurator/recolor'
import { roundGNF, simulate, type SimulatorPricing } from '@/lib/simulator/estimate'
import { buildDemoVillaGlb } from '@/seed/glb'

const pricing: SimulatorPricing = {
  types: [
    {
      key: 'villa',
      economiqueMin: 3_500_000,
      economiqueMax: 4_500_000,
      standardMin: 5_000_000,
      standardMax: 6_500_000,
      hautDeGammeMin: 7_500_000,
      hautDeGammeMax: 10_000_000,
      baseMonths: 3,
      monthsPer100m2: 2.5,
      minSurface: 40,
      maxSurface: 1500,
    },
  ],
  zones: [
    { key: 'conakry', coefficient: 1, extraMonths: 0 },
    { key: 'interieur', coefficient: 1.1, extraMonths: 1 },
  ],
}

describe('simulateur de projet', () => {
  it('calcule la fourchette de coût et de délai', () => {
    const r = simulate(pricing, { type: 'villa', surface: 200, finish: 'standard', zone: 'conakry' })
    expect(r).toEqual({
      ok: true,
      costMin: 1_000_000_000,
      costMax: 1_300_000_000,
      pricePerM2Min: 5_000_000,
      pricePerM2Max: 6_500_000,
      monthsMin: 8,
      monthsMax: 10,
    })
  })

  it('applique le coefficient et le délai de la zone', () => {
    const r = simulate(pricing, { type: 'villa', surface: 100, finish: 'economique', zone: 'interieur' })
    expect(r).toMatchObject({ ok: true, costMin: 385_000_000, costMax: 495_000_000, monthsMin: 7 })
  })

  it('refuse une surface hors bornes ou un type inconnu', () => {
    expect(simulate(pricing, { type: 'villa', surface: 10, finish: 'standard', zone: 'conakry' })).toEqual({
      ok: false,
      reason: 'surface',
      minSurface: 40,
      maxSurface: 1500,
    })
    expect(simulate(pricing, { type: 'piscine', surface: 100, finish: 'standard', zone: 'conakry' })).toEqual({ ok: false, reason: 'unknownType' })
  })

  it('arrondit comme un devis papier', () => {
    expect(roundGNF(1_234_567_890)).toBe(1_235_000_000)
    expect(roundGNF(4_567_000)).toBe(4_600_000)
  })
})

describe('configurateur : sélection du mur', () => {
  /** Image 4 × 2 : moitié gauche beige (mur), moitié droite bleue (fenêtre). */
  const image = (() => {
    const data = new Uint8ClampedArray(4 * 2 * 4)
    for (let i = 0; i < 8; i++) {
      const [r, g, b] = i % 4 < 2 ? [230, 220, 200] : [40, 60, 120]
      data.set([r, g, b, 255], i * 4)
    }
    return { width: 4, height: 2, data } as ImageData
  })()

  it('sélectionne la zone continue de même couleur', () => {
    expect(Array.from(floodFillMask(image, 0, 0, 30))).toEqual([1, 1, 0, 0, 1, 1, 0, 0])
  })

  it('déborde si la tolérance est trop grande', () => {
    expect(floodFillMask(image, 0, 0, 255).every((v) => v === 1)).toBe(true)
  })

  it('lit les couleurs du nuancier', () => {
    expect(hexToRgb('#A0521E')).toEqual([160, 82, 30])
  })
})

describe('maquette 3D de démonstration', () => {
  it('produit un fichier glTF binaire valide', () => {
    const glb = buildDemoVillaGlb()
    expect(glb.toString('ascii', 0, 4)).toBe('glTF')
    expect(glb.readUInt32LE(4)).toBe(2)
    expect(glb.readUInt32LE(8)).toBe(glb.length)

    const jsonLength = glb.readUInt32LE(12)
    const json = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength))
    expect(json.asset.version).toBe('2.0')
    expect(json.meshes.length).toBe(json.materials.length)
    // Chaque accès aux données reste dans les limites du bloc binaire
    const binLength = glb.readUInt32LE(20 + jsonLength)
    for (const view of json.bufferViews) expect(view.byteOffset + view.byteLength).toBeLessThanOrEqual(binLength)
    expect(glb.length).toBeLessThan(200 * 1024)
  })
})
