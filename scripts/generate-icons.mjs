/**
 * Génère les icônes PWA provisoires à partir du monogramme (en attendant le logo officiel).
 * Usage : node scripts/generate-icons.mjs
 * Pour le vrai logo : remplacez le SVG ci-dessous par celui du logo et relancez le script.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const outDir = path.resolve('public/icons')

// Monogramme « AD » : A blanc et D sable sur latérite, fond vert Fouta
const monogram = (padding) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1F4A3A"/>
  <g transform="translate(${padding} ${padding}) scale(${(512 - padding * 2) / 32})">
    <rect width="32" height="32" rx="3" fill="#A0521E"/>
    <path d="M7 24 L13 8 h2 L21 24 h-3.2 l-1.4-4 h-5.8 l-1.4 4 Z M11.6 17.4 h3.8 L13.5 12 Z" fill="#fff"/>
    <path d="M22 8 h1 a7 8 0 0 1 0 16 h-1 Z M24.5 11.2 a4 4.8 0 0 1 0 9.6 Z" fill="#E0A46A" fill-rule="evenodd"/>
  </g>
</svg>`

await mkdir(outDir, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192, padding: 48 },
  { file: 'icon-512.png', size: 512, padding: 48 },
  // Zone de sécurité « maskable » : le motif reste dans les 80 % centraux
  { file: 'maskable-512.png', size: 512, padding: 104 },
  { file: 'apple-touch-icon.png', size: 180, padding: 56 },
]

for (const { file, size, padding } of targets) {
  const png = await sharp(Buffer.from(monogram(padding))).resize(size, size).png().toBuffer()
  await writeFile(path.join(outDir, file), png)
  console.log(`✔ ${file} (${size}×${size})`)
}

// Favicon vectoriel
await writeFile(
  path.resolve('src/app/icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="3" fill="#A0521E"/><path d="M7 24 L13 8 h2 L21 24 h-3.2 l-1.4-4 h-5.8 l-1.4 4 Z M11.6 17.4 h3.8 L13.5 12 Z" fill="#fff"/><path d="M22 8 h1 a7 8 0 0 1 0 16 h-1 Z M24.5 11.2 a4 4.8 0 0 1 0 9.6 Z" fill="#E0A46A" fill-rule="evenodd"/></svg>\n`,
)
console.log('✔ src/app/icon.svg')
