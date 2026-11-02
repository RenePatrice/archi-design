import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '../access/roles'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Sessions (dates) de chaque formation : alimentent le calendrier et le formulaire d'inscription. */
export const TrainingSessions: CollectionConfig = {
  slug: 'training-sessions',
  labels: {
    singular: { fr: 'Session de formation', en: 'Training session' },
    plural: { fr: 'Sessions de formation', en: 'Training sessions' },
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'training', 'startDate', 'seats', 'status'],
    group: { fr: 'Boutique et formations', en: 'Shop and training' },
  },
  defaultSort: 'startDate',
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      name: 'training',
      type: 'relationship',
      relationTo: 'trainings',
      label: { fr: 'Formation', en: 'Training' },
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: { fr: 'Début', en: 'Start' },
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
        {
          name: 'endDate',
          type: 'date',
          label: { fr: 'Fin', en: 'End' },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text', label: { fr: 'Lieu', en: 'Location' }, defaultValue: 'Conakry' },
        { name: 'seats', type: 'number', label: { fr: 'Places', en: 'Seats' }, min: 1, defaultValue: 15 },
        {
          name: 'status',
          type: 'select',
          label: { fr: 'Statut', en: 'Status' },
          defaultValue: 'ouverte',
          options: [
            { value: 'ouverte', label: { fr: 'Inscriptions ouvertes', en: 'Open' } },
            { value: 'complete', label: { fr: 'Complète', en: 'Full' } },
            { value: 'annulee', label: { fr: 'Annulée', en: 'Cancelled' } },
          ],
        },
      ],
    },
    {
      // Libellé lisible dans le back-office et les e-mails, calculé automatiquement
      name: 'label',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          async ({ siblingData, req }) => {
            const id = typeof siblingData.training === 'object' ? siblingData.training?.id : siblingData.training
            const training = id ? await req.payload.findByID({ collection: 'trainings', id, depth: 0, locale: 'fr', req }) : null
            const date = siblingData.startDate
              ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Conakry' }).format(new Date(siblingData.startDate))
              : ''
            return [training?.title, date].filter(Boolean).join(' – ')
          },
        ],
      },
    },
  ],
}
