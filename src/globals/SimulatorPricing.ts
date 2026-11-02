import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

const priceRow = (finish: string, fr: string, en: string) => ({
  type: 'row' as const,
  fields: [
    { name: `${finish}Min`, type: 'number' as const, label: { fr: `${fr} : min (GNF/m²)`, en: `${en}: min (GNF/m²)` }, required: true, min: 0 },
    { name: `${finish}Max`, type: 'number' as const, label: { fr: `${fr} : max (GNF/m²)`, en: `${en}: max (GNF/m²)` }, required: true, min: 0 },
  ],
})

/**
 * Grille du simulateur de projet : prix au m² par type et par finition, coefficients par zone.
 * Ces chiffres produisent une FOURCHETTE indicative, jamais un devis ferme.
 */
export const SimulatorPricing: GlobalConfig = {
  slug: 'simulator-pricing',
  label: { fr: 'Grille du simulateur', en: 'Simulator pricing' },
  admin: {
    group: { fr: 'Boutique et formations', en: 'Shop and training' },
    description: {
      fr: 'Prix au m² utilisés par le simulateur de devis (/simulateur) et le PDF de pré-devis.',
      en: 'Prices per m² used by the quote simulator.',
    },
  },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: 'types',
      type: 'array',
      label: { fr: 'Types de projet', en: 'Project types' },
      labels: { singular: { fr: 'Type', en: 'Type' }, plural: { fr: 'Types', en: 'Types' } },
      fields: [
        {
          name: 'key',
          type: 'select',
          label: { fr: 'Type de projet', en: 'Project type' },
          required: true,
          options: [
            { value: 'villa', label: { fr: 'Villa / maison', en: 'Villa / house' } },
            { value: 'immeuble', label: { fr: 'Immeuble', en: 'Apartment building' } },
            { value: 'commerce', label: { fr: 'Commerce', en: 'Shop' } },
            { value: 'bureaux', label: { fr: 'Bureaux', en: 'Offices' } },
            { value: 'renovation', label: { fr: 'Rénovation', en: 'Renovation' } },
            { value: 'interieur', label: { fr: 'Aménagement intérieur', en: 'Interior fit-out' } },
          ],
        },
        priceRow('economique', 'Économique', 'Basic'),
        priceRow('standard', 'Standard', 'Standard'),
        priceRow('hautDeGamme', 'Haut de gamme', 'Premium'),
        {
          type: 'row',
          fields: [
            { name: 'baseMonths', type: 'number', label: { fr: 'Délai fixe (mois)', en: 'Fixed time (months)' }, required: true, min: 0 },
            {
              name: 'monthsPer100m2',
              type: 'number',
              label: { fr: 'Mois par 100 m²', en: 'Months per 100 m²' },
              required: true,
              min: 0,
            },
            { name: 'minSurface', type: 'number', label: { fr: 'Surface min (m²)', en: 'Min area' }, defaultValue: 10 },
            { name: 'maxSurface', type: 'number', label: { fr: 'Surface max (m²)', en: 'Max area' }, defaultValue: 5000 },
          ],
        },
      ],
    },
    {
      name: 'zones',
      type: 'array',
      label: { fr: 'Zones', en: 'Areas' },
      labels: { singular: { fr: 'Zone', en: 'Area' }, plural: { fr: 'Zones', en: 'Areas' } },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'key',
              type: 'select',
              label: { fr: 'Zone', en: 'Area' },
              required: true,
              options: [
                { value: 'conakry', label: { fr: 'Grand Conakry', en: 'Greater Conakry' } },
                { value: 'interieur', label: { fr: 'Intérieur de la Guinée', en: 'Inland Guinea' } },
                { value: 'sousRegion', label: { fr: 'Afrique de l’Ouest', en: 'West Africa' } },
              ],
            },
            {
              name: 'coefficient',
              type: 'number',
              label: { fr: 'Coefficient de prix', en: 'Price coefficient' },
              required: true,
              defaultValue: 1,
              min: 0.5,
              max: 3,
              admin: { step: 0.05, description: { fr: '1 = prix de base ; 1,15 = +15 % (transport des matériaux…)', en: '1 = base price' } },
            },
            { name: 'extraMonths', type: 'number', label: { fr: 'Mois supplémentaires', en: 'Extra months' }, defaultValue: 0, min: 0 },
          ],
        },
      ],
    },
  ],
}
