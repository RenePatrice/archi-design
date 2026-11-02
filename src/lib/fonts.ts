import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from 'next/font/google'

/*
 * Polices téléchargées au moment du build et servies par le site lui-même
 * (aucune requête vers Google côté visiteur).
 */

/** Titres : Cormorant Garamond, serif fin des studios d'architecture (romain et italique). */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'], // couvre le français (é, è, à, ç, œ…) ; latin-ext n'apporterait que du poids
  weight: ['500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

/** Texte courant. */
export const manrope = Manrope({
  subsets: ['latin'], // couvre le français (é, è, à, ç, œ…) ; latin-ext n'apporterait que du poids
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

export const fontVariables = `${cormorant.variable} ${manrope.variable} ${plexMono.variable}`
