import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Partenaires et clients de référence (bandeau de l'accueil). */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: {
    singular: { fr: 'Partenaire', en: 'Partner' },
    plural: { fr: 'Partenaires', en: 'Partners' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', type: 'text', label: { fr: 'Nom', en: 'Name' }, required: true },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
      admin: { description: { fr: 'Sans logo, le nom s’affiche en texte.', en: 'Without a logo, the name is shown.' } },
    },
    { name: 'url', type: 'text', label: { fr: 'Site web', en: 'Website' } },
    { name: 'order', type: 'number', label: { fr: 'Ordre', en: 'Order' }, defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
