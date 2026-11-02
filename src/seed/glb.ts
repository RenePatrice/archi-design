/**
 * Générateur de maquette 3D de démonstration au format glTF binaire (.glb), sans dépendance.
 * Construit une villa R+1 bioclimatique : deux niveaux, toiture débordante, brise-soleil
 * en bois et baies vitrées. À remplacer par les vraies maquettes exportées de SketchUp ou Revit.
 */

type Mesh = { positions: number[]; normals: number[]; indices: number[] }
type Material = { name: string; hex: string; roughness: number }

/** Couleur sRGB (#RRGGBB) vers l'espace linéaire attendu par glTF. */
function linear(hex: string): [number, number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255), 1]
}

function addQuad(mesh: Mesh, a: number[], b: number[], c: number[], d: number[], normal: number[]) {
  const base = mesh.positions.length / 3
  for (const v of [a, b, c, d]) {
    mesh.positions.push(...v)
    mesh.normals.push(...normal)
  }
  mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
}

function addTriangle(mesh: Mesh, a: number[], b: number[], c: number[]) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
  const len = Math.hypot(n[0], n[1], n[2]) || 1
  const base = mesh.positions.length / 3
  for (const p of [a, b, c]) {
    mesh.positions.push(...p)
    mesh.normals.push(n[0] / len, n[1] / len, n[2] / len)
  }
  mesh.indices.push(base, base + 1, base + 2)
}

/** Pavé aligné sur les axes (x0,y0,z0) → (x1,y1,z1), faces orientées vers l'extérieur. */
function addBox(mesh: Mesh, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  addQuad(mesh, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1])
  addQuad(mesh, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1])
  addQuad(mesh, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0])
  addQuad(mesh, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0])
  addQuad(mesh, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0])
  addQuad(mesh, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0])
}

/** Toiture à deux pans au-dessus du rectangle (x0..x1, z0..z1), faîtage parallèle à x. */
function addGableRoof(mesh: Mesh, x0: number, x1: number, z0: number, z1: number, y: number, ridge: number) {
  const zm = (z0 + z1) / 2
  addTriangle(mesh, [x0, y, z1], [x1, y, z1], [x1, y + ridge, zm])
  addTriangle(mesh, [x0, y, z1], [x1, y + ridge, zm], [x0, y + ridge, zm])
  addTriangle(mesh, [x1, y, z0], [x0, y, z0], [x0, y + ridge, zm])
  addTriangle(mesh, [x1, y, z0], [x0, y + ridge, zm], [x1, y + ridge, zm])
  addTriangle(mesh, [x1, y, z1], [x1, y, z0], [x1, y + ridge, zm])
  addTriangle(mesh, [x0, y, z0], [x0, y, z1], [x0, y + ridge, zm])
}

function buildVilla() {
  const parts: Record<string, Mesh> = {}
  const mesh = (name: string) => (parts[name] ??= { positions: [], normals: [], indices: [] })

  // Socle et terrasse
  addBox(mesh('socle'), -7, 0, -6, 7, 0.3, 7)
  // Rez-de-chaussée et étage (en léger décalage pour ombrer la terrasse)
  addBox(mesh('murs'), -5, 0.3, -4, 5, 3.3, 3)
  addBox(mesh('murs'), -5.5, 3.3, -4.5, 3.5, 6.3, 3.6)
  // Dalle débordante de l'étage
  addBox(mesh('dalle'), -6, 3.3, -5, 5.5, 3.5, 4.2)
  // Toiture : dalle + toiture légère en latérite (double toiture ventilée)
  addBox(mesh('dalle'), -6.2, 6.3, -5.2, 4.2, 6.5, 4.3)
  addGableRoof(mesh('toit'), -6.6, 4.6, -5.6, 4.7, 7.0, 1.4)
  // Poteaux de la toiture ventilée
  for (const [x, z] of [[-6, -5], [4, -5], [-6, 4.1], [4, 4.1]]) addBox(mesh('bois'), x, 6.5, z, x + 0.2, 7.0, z + 0.2)
  // Baies vitrées
  addBox(mesh('verre'), -4, 0.6, 3.01, -0.5, 2.9, 3.05)
  addBox(mesh('verre'), 1, 0.6, 3.01, 4, 2.9, 3.05)
  addBox(mesh('verre'), -4.5, 3.9, 3.61, 2.5, 5.9, 3.65)
  // Brise-soleil verticaux en bois devant l'étage
  for (let x = -4.6; x <= 2.4; x += 0.45) addBox(mesh('bois'), x, 3.6, 3.8, x + 0.12, 6.2, 4.0)
  // Porte d'entrée
  addBox(mesh('bois'), -0.3, 0.3, 3.01, 0.8, 2.6, 3.06)
  return parts
}

const MATERIALS: Record<string, Material> = {
  socle: { name: 'Terrasse', hex: '#B98A5E', roughness: 0.95 },
  murs: { name: 'Enduit kaolin', hex: '#F2F1EC', roughness: 0.9 },
  dalle: { name: 'Béton', hex: '#C9C6BD', roughness: 0.85 },
  toit: { name: 'Tôle latérite', hex: '#A0521E', roughness: 0.6 },
  bois: { name: 'Bois local', hex: '#6B4A2E', roughness: 0.7 },
  verre: { name: 'Verre', hex: '#2B3A44', roughness: 0.15 },
}

/** Assemble les maillages en un fichier .glb (en-tête + bloc JSON + bloc binaire). */
export function buildDemoVillaGlb(): Buffer {
  const parts = buildVilla()
  const names = Object.keys(parts)
  const chunks: Buffer[] = []
  const bufferViews: object[] = []
  const accessors: object[] = []
  const meshes: object[] = []
  let offset = 0

  const push = (data: Buffer, target: number) => {
    const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)])
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: data.length, target })
    chunks.push(padded)
    offset += padded.length
    return bufferViews.length - 1
  }

  names.forEach((name, materialIndex) => {
    const m = parts[name]
    const pos = Buffer.from(new Float32Array(m.positions).buffer)
    const nor = Buffer.from(new Float32Array(m.normals).buffer)
    const idx = Buffer.from(new Uint16Array(m.indices).buffer)
    const min = [0, 1, 2].map((a) => Math.min(...m.positions.filter((_, i) => i % 3 === a)))
    const max = [0, 1, 2].map((a) => Math.max(...m.positions.filter((_, i) => i % 3 === a)))
    const count = m.positions.length / 3
    accessors.push({ bufferView: push(pos, 34962), componentType: 5126, count, type: 'VEC3', min, max })
    accessors.push({ bufferView: push(nor, 34962), componentType: 5126, count, type: 'VEC3' })
    accessors.push({ bufferView: push(idx, 34963), componentType: 5123, count: m.indices.length, type: 'SCALAR' })
    const a = accessors.length - 3
    meshes.push({ name, primitives: [{ attributes: { POSITION: a, NORMAL: a + 1 }, indices: a + 2, material: materialIndex }] })
  })

  const bin = Buffer.concat(chunks)
  const json = {
    asset: { version: '2.0', generator: 'ARCHI-DESIGN seed' },
    scene: 0,
    scenes: [{ name: 'Villa', nodes: names.map((_, i) => i) }],
    nodes: names.map((name, i) => ({ name, mesh: i })),
    meshes,
    materials: names.map((name) => ({
      name: MATERIALS[name].name,
      pbrMetallicRoughness: { baseColorFactor: linear(MATERIALS[name].hex), metallicFactor: 0, roughnessFactor: MATERIALS[name].roughness },
    })),
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.length }],
  }

  let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8')
  jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)])
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0) // « glTF »
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + bin.length, 8)
  const chunkHeader = (length: number, type: number) => {
    const b = Buffer.alloc(8)
    b.writeUInt32LE(length, 0)
    b.writeUInt32LE(type, 4)
    return b
  }
  return Buffer.concat([header, chunkHeader(jsonBuf.length, 0x4e4f534a), jsonBuf, chunkHeader(bin.length, 0x004e4942), bin])
}
