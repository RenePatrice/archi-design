import type { CollectionConfig } from 'payload'

import { anyone, hasRole, isStaff } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { poles } from '../lib/navigation'

/**
 * Les 8 pôles de l'entreprise. Chaque pôle a sa page « Services » (sauf Formation et
 * Commerce, qui ont leurs propres rubriques) et sa boîte de réception des demandes.
 */
export const Poles: CollectionConfig = {
  slug: 'poles',
  labels: {
    singular: { fr: 'Pôle', en: 'Division' },
    plural: { fr: 'Pôles et services', en: 'Divisions and services' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'hasServicePage'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Nom du pôle', en: 'Name' }, required: true, localized: true },
    slugField(),
    {
      name: 'key',
      type: 'select',
      label: { fr: 'Identifiant technique', en: 'Technical key' },
      required: true,
      unique: true,
      options: poles.map((value) => ({ label: value, value })),
      admin: {
        position: 'sidebar',
        description: { fr: 'Relie le pôle aux formulaires et aux modèles d’e-mail.', en: 'Links forms and e-mails.' },
      },
    },
    {
      name: 'order',
      type: 'number',
      label: { fr: 'Ordre dans la chaîne de valeur', en: 'Order in the value chain' },
      required: true,
      defaultValue: 1,
      admin: { position: 'sidebar' },
    },
    {
      name: 'hasServicePage',
      type: 'checkbox',
      label: { fr: 'Afficher dans « Services »', en: 'Show in Services' },
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tone',
      type: 'select',
      label: { fr: 'Couleur', en: 'Colour' },
      defaultValue: 'accent',
      options: [
        { label: { fr: 'Latérite (BTP, matière)', en: 'Laterite' }, value: 'accent' },
        { label: { fr: 'Vert Fouta (conseil, institutionnel)', en: 'Fouta green' }, value: 'deep' },
        { label: { fr: 'Indigo leppi (créatif)', en: 'Leppi indigo' }, value: 'creative' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: { fr: 'Accroche (1 à 2 phrases)', en: 'Summary' },
      required: true,
      localized: true,
    },
    { name: 'description', type: 'richText', label: { fr: 'Présentation', en: 'Description' }, localized: true },
    {
      name: 'services',
      type: 'array',
      label: { fr: 'Prestations', en: 'Services' },
      labels: { singular: { fr: 'Prestation', en: 'Service' }, plural: { fr: 'Prestations', en: 'Services' } },
      fields: [
        { name: 'title', type: 'text', label: { fr: 'Intitulé', en: 'Title' }, required: true, localized: true },
        { name: 'text', type: 'textarea', label: { fr: 'Description', en: 'Description' }, localized: true },
      ],
    },
    {
      name: 'pack',
      type: 'textarea',
      label: { fr: 'Pack intégré proposé', en: 'Integrated package' },
      localized: true,
      admin: {
        description: {
          fr: 'Ce que le client gagne à enchaîner ce pôle avec le suivant (affiché dans la chaîne de valeur).',
          en: 'Shown in the interactive value chain.',
        },
      },
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: { fr: 'Image', en: 'Image' } },
    {
      name: 'whatsappMessage',
      type: 'text',
      label: { fr: 'Message WhatsApp pré-rempli', en: 'Prefilled WhatsApp message' },
      localized: true,
    },
    {
      name: 'receptionEmail',
      type: 'email',
      label: { fr: 'E-mail de réception des demandes', en: 'Requests inbox' },
      access: {
        // Adresse interne : jamais exposée sur le site public
        read: ({ req }) => hasRole(req, 'admin', 'equipe'),
      },
      admin: { position: 'sidebar' },
    },
  ],
}
