import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Membres de l'équipe présentés sur la page « À propos ». */
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: { fr: 'Membre de l’équipe', en: 'Team member' },
    plural: { fr: 'Équipe', en: 'Team' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: { fr: 'Nom', en: 'Name' }, required: true },
        { name: 'role', type: 'text', label: { fr: 'Fonction', en: 'Role' }, required: true, localized: true },
      ],
    },
    { name: 'bio', type: 'textarea', label: { fr: 'Présentation courte', en: 'Short bio' }, localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media', label: { fr: 'Photo', en: 'Photo' } },
    { name: 'order', type: 'number', label: { fr: 'Ordre', en: 'Order' }, defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
