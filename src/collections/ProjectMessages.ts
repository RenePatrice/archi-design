import type { CollectionConfig } from 'payload'

import { viaClientProject } from '../access/client'
import { hasRole, isAdmin, isStaff } from '../access/roles'
import { notifyMessageAfterChange } from '../hooks/client-notifications'

/**
 * Messages entre le client et l'équipe, par projet suivi.
 * L'équipe répond depuis le back-office ; le client écrit depuis son espace (le site vérifie
 * qu'il fait bien partie du projet avant d'enregistrer).
 */
export const ProjectMessages: CollectionConfig = {
  slug: 'project-messages',
  labels: {
    singular: { fr: 'Message', en: 'Message' },
    plural: { fr: 'Messages clients', en: 'Client messages' },
  },
  admin: {
    useAsTitle: 'excerpt',
    defaultColumns: ['excerpt', 'clientProject', 'author', 'fromStaff', 'createdAt'],
    group: { fr: 'Espace client', en: 'Client area' },
  },
  defaultSort: '-createdAt',
  access: { read: viaClientProject, create: isStaff, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeChange: [
      // L'auteur est toujours la personne connectée (sauf création par le site pour un client)
      ({ data, req, operation }) => {
        if (operation !== 'create') return data
        const author = data.author ?? req.user?.id
        const fromStaff = data.fromStaff ?? hasRole(req, 'admin', 'equipe')
        return { ...data, author, fromStaff, excerpt: String(data.body ?? '').slice(0, 80) }
      },
    ],
    afterChange: [notifyMessageAfterChange],
  },
  fields: [
    {
      name: 'clientProject',
      type: 'relationship',
      relationTo: 'client-projects',
      label: { fr: 'Projet suivi', en: 'Tracked project' },
      required: true,
      index: true,
    },
    { name: 'body', type: 'textarea', label: 'Message', required: true, maxLength: 4000 },
    { name: 'excerpt', type: 'text', admin: { hidden: true } },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: { fr: 'Auteur', en: 'Author' },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'fromStaff',
      type: 'checkbox',
      label: { fr: 'Envoyé par l’équipe', en: 'Sent by the team' },
      admin: { readOnly: true, position: 'sidebar' },
      access: { update: () => false },
    },
    {
      name: 'readByClient',
      type: 'checkbox',
      label: { fr: 'Lu par le client', en: 'Read by client' },
      defaultValue: false,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'readByStaff',
      type: 'checkbox',
      label: { fr: 'Traité par l’équipe', en: 'Handled by team' },
      defaultValue: false,
      admin: { position: 'sidebar' },
      access: { update: ({ req }) => hasRole(req, 'admin', 'equipe') },
    },
  ],
}
