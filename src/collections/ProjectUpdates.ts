import type { CollectionConfig } from 'payload'

import { viaClientProject } from '../access/client'
import { isStaff } from '../access/roles'
import { notifyClientAfterChange } from '../hooks/client-notifications'

/** Actualités de chantier : texte daté et photos, publiés dans l'espace client. */
export const ProjectUpdates: CollectionConfig = {
  slug: 'project-updates',
  labels: {
    singular: { fr: 'Actualité de chantier', en: 'Site update' },
    plural: { fr: 'Actualités de chantier', en: 'Site updates' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'clientProject', 'date'],
    group: { fr: 'Espace client', en: 'Client area' },
  },
  defaultSort: '-date',
  access: { read: viaClientProject, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [notifyClientAfterChange('update')] },
  fields: [
    {
      name: 'clientProject',
      type: 'relationship',
      relationTo: 'client-projects',
      label: { fr: 'Projet suivi', en: 'Tracked project' },
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true },
        {
          name: 'date',
          type: 'date',
          label: { fr: 'Date', en: 'Date' },
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    { name: 'text', type: 'textarea', label: { fr: 'Ce qui a été fait', en: 'What was done' }, required: true },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'client-files',
      hasMany: true,
      label: { fr: 'Photos', en: 'Photos' },
      admin: { description: { fr: 'Photos datées du chantier (envoyées dans « Documents clients »).', en: 'Dated site photos.' } },
    },
    {
      name: 'notifyClient',
      type: 'checkbox',
      label: { fr: 'Prévenir le client par e-mail', en: 'E-mail the client' },
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
