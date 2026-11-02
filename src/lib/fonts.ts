import { Archivo, IBM_Plex_Mono, Manrope } from 'next/font/google'

/*
 * Polices téléchargées au moment du build et servies par le site lui-même
 * (aucune requête vers Google côté visiteur).
 */

/** Titres : Archivo élargi, dans l'esprit des lettrages d'enseigne. */
export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

/** Texte courant. */
export const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
})

/** Fiches techniques, numéros de commande, cotes. */
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
  preload: false,
})

export const fontVariables = `${archivo.variable} ${manrope.variable} ${plexMono.variable}`
