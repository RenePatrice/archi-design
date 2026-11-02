import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '../access/roles'
import { REQUEST_SERVICES } from '../lib/requests/services'

const placeholders =
  'Variables disponibles : {numero}, {client}, {type}, {formation}, {date}. Elles sont remplacées automatiquement.'

/**
 * Modèles d'e-mail, un par service : objet et textes de l'e-mail envoyé à l'entreprise,
 * adresses de réception, et accusé de réception envoyé au client (traduit FR/EN).
 * L'équipe les modifie sans toucher au code.
 */
export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',
  labels: {
    singular: { fr: 'Modèle d’e-mail', en: 'E-mail template' },
    plural: { fr: 'Modèles d’e-mail', en: 'E-mail templates' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'service', 'subject'],
    group: { fr: 'Demandes', en: 'Requests' },
    description: { fr: placeholders, en: 'Placeholders: {numero}, {client}, {type}, {formation}, {date}.' },
  },
  access: { read: isStaff, create: isAdmin, update: isStaff, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', label: { fr: 'Nom du modèle', en: 'Template name' }, required: true },
    {
      name: 'service',
      type: 'select',
      label: { fr: 'Service', en: 'Service' },
      required: true,
      unique: true,
      options: REQUEST_SERVICES.map((value) => ({ value, label: value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'recipients',
      type: 'array',
      label: { fr: 'Adresses de réception', en: 'Recipients' },
      labels: { singular: { fr: 'Adresse', en: 'Address' }, plural: { fr: 'Adresses', en: 'Addresses' } },
      admin: {
        description: {
          fr: 'Boîtes qui reçoivent les demandes de ce service. Vide : l’adresse par défaut des réglages du site.',
          en: 'Empty: default inbox from site settings.',
        },
      },
      fields: [{ name: 'email', type: 'email', label: 'E-mail', required: true }],
    },
    {
      type: 'collapsible',
      label: { fr: 'E-mail reçu par l’entreprise', en: 'Company e-mail' },
      fields: [
        {
          name: 'subject',
          type: 'text',
          label: { fr: 'Objet', en: 'Subject' },
          required: true,
          admin: { description: { fr: 'ex. [ARCHI-DESIGN] Demande de projet – {type}', en: placeholders } },
        },
        { name: 'intro', type: 'textarea', label: { fr: 'Texte d’introduction', en: 'Introduction' } },
      ],
    },
    {
      type: 'collapsible',
      label: { fr: 'Accusé de réception envoyé au client', en: 'Customer acknowledgement' },
      fields: [
        { name: 'ackSubject', type: 'text', label: { fr: 'Objet', en: 'Subject' }, required: true, localized: true },
        { name: 'ackIntro', type: 'textarea', label: { fr: 'Message', en: 'Message' }, required: true, localized: true },
        {
          name: 'ackDelay',
          type: 'text',
          label: { fr: 'Délai de réponse annoncé', en: 'Announced response time' },
          localized: true,
        },
        { name: 'ackOutro', type: 'textarea', label: { fr: 'Formule de fin', en: 'Closing' }, localized: true },
      ],
    },
  ],
}
