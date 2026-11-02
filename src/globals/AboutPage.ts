import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateGlobal } from '../hooks/revalidate'

/** Contenu de la page « À propos » : vision, mission, valeurs, histoire, engagements. */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: { fr: 'Page « À propos »', en: 'About page' },
  admin: { group: { fr: 'Contenu', en: 'Content' } },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    { name: 'intro', type: 'textarea', label: { fr: 'Introduction', en: 'Introduction' }, localized: true },
    { name: 'vision', type: 'textarea', label: 'Vision', localized: true },
    { name: 'mission', type: 'textarea', label: 'Mission', localized: true },
    {
      name: 'values',
      type: 'array',
      label: { fr: 'Valeurs', en: 'Values' },
      labels: { singular: { fr: 'Valeur', en: 'Value' }, plural: { fr: 'Valeurs', en: 'Values' } },
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Valeur', en: 'Value' }, required: true, localized: true },
        { name: 'text', type: 'textarea', label: { fr: 'Explication', en: 'Explanation' }, localized: true },
      ],
    },
    {
      name: 'history',
      type: 'array',
      label: { fr: 'Histoire (dates clés)', en: 'History (milestones)' },
      labels: { singular: { fr: 'Étape', en: 'Milestone' }, plural: { fr: 'Étapes', en: 'Milestones' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'year', type: 'text', label: { fr: 'Année', en: 'Year' }, required: true },
            { name: 'title', type: 'text', label: { fr: 'Événement', en: 'Event' }, required: true, localized: true },
          ],
        },
        { name: 'text', type: 'textarea', label: { fr: 'Détail', en: 'Detail' }, localized: true },
      ],
    },
    {
      name: 'commitments',
      type: 'array',
      label: { fr: 'Engagements local et durable', en: 'Local and sustainable commitments' },
      labels: { singular: { fr: 'Engagement', en: 'Commitment' }, plural: { fr: 'Engagements', en: 'Commitments' } },
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Engagement', en: 'Commitment' }, required: true, localized: true },
        { name: 'text', type: 'textarea', label: { fr: 'Détail', en: 'Detail' }, localized: true },
      ],
    },
  ],
}
