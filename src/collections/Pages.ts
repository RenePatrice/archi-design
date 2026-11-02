import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Pages de texte simples : mentions légales, confidentialité, CGV… */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { fr: 'Page de texte', en: 'Text page' },
    plural: { fr: 'Pages légales et textes', en: 'Legal and text pages' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true, localized: true },
    slugField(),
    {
      name: 'showInFooter',
      type: 'checkbox',
      label: { fr: 'Lien dans le pied de page', en: 'Link in footer' },
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'content', type: 'richText', label: { fr: 'Contenu', en: 'Content' }, required: true, localized: true },
  ],
}
