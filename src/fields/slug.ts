import type { TextField } from 'payload'

/** Transforme un titre en adresse web : « Villa Kipé — R+1 » devient « villa-kipe-r-1 ». */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Champ « slug » (adresse de la page), rempli automatiquement à partir du titre français
 * s'il est laissé vide.
 */
export const slugField = (sourceField = 'title'): TextField => ({
  name: 'slug',
  type: 'text',
  label: { fr: 'Adresse de la page (slug)', en: 'Slug' },
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: {
      fr: 'Rempli automatiquement depuis le titre. Lettres minuscules, chiffres et tirets.',
      en: 'Filled from the title. Lowercase letters, digits and hyphens.',
    },
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[sourceField]
        // Un champ traduit peut arriver sous forme d'objet { fr, en }
        const text = typeof source === 'string' ? source : source?.fr
        return typeof text === 'string' ? slugify(text) : value
      },
    ],
  },
})
