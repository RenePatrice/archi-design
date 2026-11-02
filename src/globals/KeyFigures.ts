import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

/**
 * Chiffres clés affichés en compteurs animés (accueil, puis page « Impact » en phase 4).
 */
export const KeyFigures: GlobalConfig = {
  slug: 'key-figures',
  label: { fr: 'Chiffres clés', en: 'Key figures' },
  admin: { group: { fr: 'Contenu', en: 'Content' } },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'figures',
      type: 'array',
      label: { fr: 'Chiffres', en: 'Figures' },
      labels: { singular: { fr: 'Chiffre', en: 'Figure' }, plural: { fr: 'Chiffres', en: 'Figures' } },
      maxRows: 8,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'number', label: { fr: 'Valeur', en: 'Value' }, required: true, min: 0 },
            {
              name: 'suffix',
              type: 'text',
              label: { fr: 'Suffixe', en: 'Suffix' },
              admin: { description: { fr: 'ex. +, %, m²', en: 'e.g. +, %, m²' } },
            },
          ],
        },
        { name: 'label', type: 'text', label: { fr: 'Libellé', en: 'Label' }, required: true, localized: true },
      ],
    },
  ],
}
