import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Témoignages clients affichés sur l'accueil et les pages de services. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: { fr: 'Témoignage', en: 'Testimonial' },
    plural: { fr: 'Témoignages', en: 'Testimonials' },
  },
  admin: {
    useAsTitle: 'author',
    defaultColumns: ['author', 'context', 'pole'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'quote', type: 'textarea', label: { fr: 'Témoignage', en: 'Quote' }, required: true, localized: true },
    {
      type: 'row',
      fields: [
        { name: 'author', type: 'text', label: { fr: 'Nom', en: 'Name' }, required: true },
        {
          name: 'context',
          type: 'text',
          label: { fr: 'Fonction ou projet', en: 'Role or project' },
          localized: true,
          admin: { description: { fr: 'ex. Propriétaire, villa à Kipé', en: 'e.g. Owner, villa in Kipé' } },
        },
      ],
    },
    { name: 'pole', type: 'relationship', relationTo: 'poles', label: { fr: 'Pôle', en: 'Division' } },
    { name: 'order', type: 'number', label: { fr: 'Ordre', en: 'Order' }, defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
