import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

/**
 * Grille de prix indicatifs de l'impression en ligne : sert au calcul en direct sur /impression.
 * Le prix final est toujours confirmé par l'équipe avec le bon à tirer.
 */
export const PrintPricing: GlobalConfig = {
  slug: 'print-pricing',
  label: { fr: 'Tarifs impression', en: 'Print pricing' },
  admin: { group: { fr: 'Boutique et formations', en: 'Shop and training' } },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'supports',
      type: 'array',
      label: { fr: 'Supports', en: 'Media' },
      labels: { singular: { fr: 'Support', en: 'Medium' }, plural: { fr: 'Supports', en: 'Media' } },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'key',
              type: 'select',
              label: { fr: 'Support', en: 'Medium' },
              required: true,
              options: [
                { value: 'textile', label: { fr: 'Textile (t-shirt…)', en: 'Textile' } },
                { value: 'affiche', label: { fr: 'Affiche', en: 'Poster' } },
                { value: 'bache', label: { fr: 'Bâche', en: 'Banner' } },
                { value: 'carte', label: { fr: 'Cartes de visite', en: 'Business cards' } },
                { value: 'autocollant', label: { fr: 'Autocollants', en: 'Stickers' } },
                { value: 'cachet', label: { fr: 'Cachet / tampon', en: 'Stamp' } },
              ],
            },
            {
              name: 'pricing',
              type: 'select',
              label: { fr: 'Calcul', en: 'Pricing' },
              required: true,
              defaultValue: 'unit',
              options: [
                { value: 'unit', label: { fr: 'Prix par pièce', en: 'Per piece' } },
                { value: 'area', label: { fr: 'Prix au m²', en: 'Per m²' } },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'number', label: { fr: 'Prix (GNF)', en: 'Price (GNF)' }, required: true, min: 0 },
            { name: 'minQuantity', type: 'number', label: { fr: 'Quantité minimale', en: 'Minimum quantity' }, min: 1, defaultValue: 1 },
            {
              name: 'setupFee',
              type: 'number',
              label: { fr: 'Frais fixes (GNF)', en: 'Setup fee (GNF)' },
              min: 0,
              defaultValue: 0,
              admin: { description: { fr: 'ex. préparation de l’écran de sérigraphie', en: 'e.g. screen preparation' } },
            },
          ],
        },
        {
          name: 'discounts',
          type: 'array',
          label: { fr: 'Remises par quantité', en: 'Quantity discounts' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'fromQuantity', type: 'number', label: { fr: 'À partir de', en: 'From' }, required: true, min: 1 },
                { name: 'percent', type: 'number', label: { fr: 'Remise (%)', en: 'Discount (%)' }, required: true, min: 0, max: 90 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
