import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Catalogue des formations (pôle Formation). Les dates sont dans « Sessions de formation ». */
export const Trainings: CollectionConfig = {
  slug: 'trainings',
  labels: {
    singular: { fr: 'Formation', en: 'Training' },
    plural: { fr: 'Formations', en: 'Training courses' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'duration', 'price'],
    group: { fr: 'Boutique et formations', en: 'Shop and training' },
  },
  defaultSort: 'order',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Intitulé', en: 'Title' }, required: true, localized: true },
    slugField(),
    { name: 'summary', type: 'textarea', label: { fr: 'Résumé', en: 'Summary' }, required: true, localized: true },
    {
      type: 'row',
      fields: [
        { name: 'duration', type: 'text', label: { fr: 'Durée', en: 'Duration' }, required: true, localized: true },
        {
          name: 'price',
          type: 'number',
          label: { fr: 'Prix (GNF)', en: 'Price (GNF)' },
          min: 0,
          admin: { description: { fr: 'Laisser vide si gratuit ou sur devis.', en: 'Empty if free or on quote.' } },
        },
        {
          name: 'level',
          type: 'select',
          label: { fr: 'Niveau', en: 'Level' },
          defaultValue: 'debutant',
          options: [
            { value: 'debutant', label: { fr: 'Débutant', en: 'Beginner' } },
            { value: 'intermediaire', label: { fr: 'Intermédiaire', en: 'Intermediate' } },
            { value: 'avance', label: { fr: 'Avancé', en: 'Advanced' } },
            { value: 'tous', label: { fr: 'Tous niveaux', en: 'All levels' } },
          ],
        },
      ],
    },
    { name: 'trainer', type: 'text', label: { fr: 'Formateur', en: 'Trainer' } },
    { name: 'description', type: 'richText', label: { fr: 'Présentation', en: 'Description' }, localized: true },
    {
      name: 'program',
      type: 'array',
      label: { fr: 'Programme', en: 'Programme' },
      labels: { singular: { fr: 'Module', en: 'Module' }, plural: { fr: 'Modules', en: 'Modules' } },
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Module', en: 'Module' }, required: true, localized: true },
        { name: 'text', type: 'textarea', label: { fr: 'Contenu', en: 'Content' }, localized: true },
      ],
    },
    { name: 'certificate', type: 'checkbox', label: { fr: 'Certificat délivré', en: 'Certificate issued' }, defaultValue: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: { fr: 'Image', en: 'Image' } },
    { name: 'order', type: 'number', label: { fr: 'Ordre', en: 'Order' }, defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
