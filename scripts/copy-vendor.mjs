/**
 * Copie dans public/vendor/ les fichiers que certaines bibliothèques chargent à part :
 * le « worker » de MapLibre (dessin de la carte en arrière-plan) ne peut pas être empaqueté
 * par Next.js. Lancé automatiquement après « npm install » (postinstall).
 */
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('public/vendor')
await mkdir(outDir, { recursive: true })
await copyFile(path.resolve('node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'), path.join(outDir, 'maplibre-gl-worker.mjs'))
console.log('✔ public/vendor/maplibre-gl-worker.mjs')
