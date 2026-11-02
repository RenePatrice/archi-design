import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'

/**
 * Médiathèque : toutes les images du site.
 * Chaque image est déclinée en WebP à plusieurs largeurs pour rester légère
 * sur les connexions mobiles lentes (objectif : accueil < 1,5 Mo).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { fr: 'Média', en: 'Media' },
    plural: { fr: 'Médiathèque', en: 'Media library' },
  },
  admin: {
    group: { fr: 'Contenu', en: 'Content' },
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: { fr: 'Texte alternatif', en: 'Alt text' },
      required: true,
      localized: true,
      admin: {
        description: {
          fr: 'Décrit l’image pour les personnes malvoyantes et le référencement.',
          en: 'Describes the image for screen readers and SEO.',
        },
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: { fr: 'Légende', en: 'Caption' },
      localized: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 80 } },
    imageSizes: [
      { name: 'thumbnail', width: 400, formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 768, formatOptions: { format: 'webp', options: { quality: 78 } } },
      { name: 'hero', width: 1600, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
    adminThumbnail: 'thumbnail',
  },
}
