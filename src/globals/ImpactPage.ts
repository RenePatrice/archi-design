import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

/** Page « Impact » : emplois créés, jeunes formés, projets durables, avec compteurs animés. */
export const ImpactPage: GlobalConfig = {
  slug: 'impact-page',
  label: { fr: 'Page « Impact »', en: 'Impact page' },
  admin: { group: { fr: 'Contenu', en: 'Content' } },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'intro', type: 'textarea', label: { fr: 'Introduction', en: 'Introduction' }, localized: true },
    {
      name: 'figures',
      type: 'array',
      label: { fr: 'Indicateurs', en: 'Indicators' },
      labels: { singular: { fr: 'Indicateur', en: 'Indicator' }, plural: { fr: 'Indicateurs', en: 'Indicators' } },
      maxRows: 8,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'number', label: { fr: 'Valeur', en: 'Value' }, required: true, min: 0 },
            { name: 'suffix', type: 'text', label: { fr: 'Suffixe', en: 'Suffix' } },
            {
              name: 'axis',
              type: 'select',
              label: { fr: 'Axe', en: 'Axis' },
              defaultValue: 'emploi',
              options: [
                { value: 'emploi', label: { fr: 'Emplois et talents', en: 'Jobs and talent' } },
                { value: 'formation', label: { fr: 'Formation', en: 'Training' } },
                { value: 'durable', label: { fr: 'Durable', en: 'Sustainability' } },
                { value: 'territoire', label: { fr: 'Territoire', en: 'Territory' } },
              ],
            },
          ],
        },
        { name: 'label', type: 'text', label: { fr: 'Libellé', en: 'Label' }, required: true, localized: true },
        { name: 'detail', type: 'textarea', label: { fr: 'Explication', en: 'Detail' }, localized: true },
      ],
    },
    {
      name: 'stories',
      type: 'array',
      label: { fr: 'Récits', en: 'Stories' },
      labels: { singular: { fr: 'Récit', en: 'Story' }, plural: { fr: 'Récits', en: 'Stories' } },
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true, localized: true },
        { name: 'text', type: 'textarea', label: { fr: 'Texte', en: 'Text' }, localized: true },
        { name: 'image', type: 'upload', relationTo: 'media', label: { fr: 'Image', en: 'Image' } },
      ],
    },
  ],
}
