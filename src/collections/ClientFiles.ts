import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { clientFileRead } from '../access/client'
import { isStaff } from '../access/roles'
import { notifyClientAfterChange } from '../hooks/client-notifications'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Documents et photos de l'espace client (plans, devis, factures, photos de chantier).
 * Stockés hors de la médiathèque publique : seuls l'équipe et les clients du projet y accèdent.
 */
export const ClientFiles: CollectionConfig = {
  slug: 'client-files',
  labels: {
    singular: { fr: 'Document client', en: 'Client document' },
    plural: { fr: 'Documents clients', en: 'Client documents' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'clientProject', 'visibleToClient', 'createdAt'],
    group: { fr: 'Espace client', en: 'Client area' },
  },
  defaultSort: '-createdAt',
  access: { read: clientFileRead, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [notifyClientAfterChange('document')] },
  upload: {
    staticDir: path.resolve(dirname, '../../private-uploads/client'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    // Versions légères des photos pour les connexions lentes
    imageSizes: [
      { name: 'thumbnail', width: 480, formatOptions: { format: 'webp', options: { quality: 72 } } },
      { name: 'large', width: 1400, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true },
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
        {
          name: 'kind',
          type: 'select',
          label: { fr: 'Type', en: 'Type' },
          required: true,
          defaultValue: 'photo',
          options: [
            { value: 'photo', label: { fr: 'Photo de chantier', en: 'Site photo' } },
            { value: 'plan', label: { fr: 'Plan', en: 'Plan' } },
            { value: 'devis', label: { fr: 'Devis', en: 'Quote' } },
            { value: 'facture', label: { fr: 'Facture', en: 'Invoice' } },
            { value: 'contrat', label: { fr: 'Contrat', en: 'Contract' } },
            { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
          ],
        },
        {
          name: 'visibleToClient',
          type: 'checkbox',
          label: { fr: 'Visible par le client', en: 'Visible to client' },
          defaultValue: true,
        },
        {
          name: 'notifyClient',
          type: 'checkbox',
          label: { fr: 'Prévenir le client par e-mail', en: 'E-mail the client' },
          defaultValue: false,
          admin: { description: { fr: 'À cocher pour un document important (devis, facture…).', en: 'For important documents.' } },
        },
      ],
    },
  ],
}
