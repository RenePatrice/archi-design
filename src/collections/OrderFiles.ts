import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { isAdmin, isStaff } from '../access/roles'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Fichiers joints aux demandes (plans, photos, fichiers d'impression).
 * Stockés hors de la médiathèque publique : seule l'équipe connectée peut les ouvrir.
 */
export const OrderFiles: CollectionConfig = {
  slug: 'order-files',
  labels: {
    singular: { fr: 'Fichier client', en: 'Customer file' },
    plural: { fr: 'Fichiers clients', en: 'Customer files' },
  },
  admin: {
    group: { fr: 'Demandes', en: 'Requests' },
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    read: isStaff,
    create: () => false, // uniquement via les formulaires du site
    update: isStaff,
    delete: isAdmin,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../private-uploads'),
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/postscript',
      'application/zip',
    ],
  },
  fields: [],
}
