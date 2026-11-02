import type { CollectionConfig } from 'payload'

import { clientProjectRead } from '../access/client'
import { isAdmin, isStaff } from '../access/roles'

export const STAGE_STATUSES = ['aVenir', 'enCours', 'termine'] as const

/**
 * Suivi de projet (espace client) : un chantier ou une commande suivi en ligne par son client.
 * Étapes, avancement, et — via les onglets — actualités, documents et messages rattachés.
 */
export const ClientProjects: CollectionConfig = {
  slug: 'client-projects',
  labels: {
    singular: { fr: 'Projet suivi', en: 'Tracked project' },
    plural: { fr: 'Projets suivis', en: 'Tracked projects' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'clients', 'status', 'progress', 'updatedAt'],
    group: { fr: 'Espace client', en: 'Client area' },
    description: {
      fr: 'Chaque projet suivi apparaît dans l’espace client des personnes choisies dans « Clients ».',
      en: 'Each tracked project appears in the client area of the selected clients.',
    },
  },
  defaultSort: '-updatedAt',
  access: { read: clientProjectRead, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Nom du projet', en: 'Project name' }, required: true },
    {
      name: 'clients',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      label: { fr: 'Clients', en: 'Clients' },
      filterOptions: { role: { equals: 'client' } },
      admin: {
        position: 'sidebar',
        description: { fr: 'Comptes clients qui verront ce projet. Créez-les dans « Utilisateurs ».', en: 'Client accounts.' },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: { fr: 'Statut', en: 'Status' },
      defaultValue: 'enCours',
      options: [
        { value: 'etude', label: { fr: 'En étude', en: 'Design' } },
        { value: 'enCours', label: { fr: 'En cours', en: 'In progress' } },
        { value: 'pause', label: { fr: 'En pause', en: 'On hold' } },
        { value: 'livre', label: { fr: 'Livré', en: 'Delivered' } },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'progress',
      type: 'number',
      label: { fr: 'Avancement (%)', en: 'Progress (%)' },
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text', label: { fr: 'Lieu', en: 'Location' } },
        { name: 'startDate', type: 'date', label: { fr: 'Début', en: 'Start' }, admin: { date: { pickerAppearance: 'dayOnly' } } },
        {
          name: 'expectedEndDate',
          type: 'date',
          label: { fr: 'Livraison prévue', en: 'Expected delivery' },
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'manager',
          type: 'relationship',
          relationTo: 'users',
          label: { fr: 'Responsable du projet', en: 'Project manager' },
          filterOptions: { role: { in: ['admin', 'equipe'] } },
        },
        { name: 'order', type: 'relationship', relationTo: 'orders', label: { fr: 'Demande d’origine', en: 'Original request' } },
        { name: 'project', type: 'relationship', relationTo: 'projects', label: { fr: 'Fiche portfolio', en: 'Portfolio page' } },
      ],
    },
    { name: 'summary', type: 'textarea', label: { fr: 'Présentation pour le client', en: 'Summary for the client' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Étapes', en: 'Stages' },
          fields: [
            {
              name: 'stages',
              type: 'array',
              label: { fr: 'Étapes du projet', en: 'Project stages' },
              labels: { singular: { fr: 'Étape', en: 'Stage' }, plural: { fr: 'Étapes', en: 'Stages' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', label: { fr: 'Étape', en: 'Stage' }, required: true },
                    {
                      name: 'status',
                      type: 'select',
                      label: { fr: 'État', en: 'State' },
                      defaultValue: 'aVenir',
                      options: [
                        { value: 'aVenir', label: { fr: 'À venir', en: 'Upcoming' } },
                        { value: 'enCours', label: { fr: 'En cours', en: 'In progress' } },
                        { value: 'termine', label: { fr: 'Terminée', en: 'Done' } },
                      ],
                    },
                    { name: 'date', type: 'date', label: { fr: 'Date', en: 'Date' }, admin: { date: { pickerAppearance: 'dayOnly' } } },
                  ],
                },
                { name: 'note', type: 'textarea', label: { fr: 'Précision pour le client', en: 'Note for the client' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'Actualités', en: 'Updates' },
          fields: [{ name: 'updates', type: 'join', collection: 'project-updates', on: 'clientProject', label: { fr: 'Actualités de chantier', en: 'Site updates' } }],
        },
        {
          label: { fr: 'Documents', en: 'Documents' },
          fields: [{ name: 'files', type: 'join', collection: 'client-files', on: 'clientProject', label: { fr: 'Documents et photos', en: 'Documents and photos' } }],
        },
        {
          label: { fr: 'Messages', en: 'Messages' },
          fields: [{ name: 'messages', type: 'join', collection: 'project-messages', on: 'clientProject', label: 'Messages' }],
        },
      ],
    },
  ],
}
