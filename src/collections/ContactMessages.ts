import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '../access/roles'

/**
 * Messages envoyés par le formulaire de contact. Ils sont créés par le serveur du site
 * (jamais directement par l'API publique) ; l'équipe les lit et les marque comme traités.
 * L'envoi par e-mail à l'entreprise arrive à la phase 3.
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: {
    singular: { fr: 'Message de contact', en: 'Contact message' },
    plural: { fr: 'Messages de contact', en: 'Contact messages' },
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'phone', 'status', 'createdAt'],
    group: { fr: 'Demandes', en: 'Requests' },
  },
  defaultSort: '-createdAt',
  access: {
    read: isStaff,
    create: () => false, // uniquement via le formulaire du site (API locale)
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: { fr: 'Statut', en: 'Status' },
      defaultValue: 'nouveau',
      options: [
        { label: { fr: 'Nouveau', en: 'New' }, value: 'nouveau' },
        { label: { fr: 'Contacté', en: 'Contacted' }, value: 'contacte' },
        { label: { fr: 'Traité', en: 'Closed' }, value: 'traite' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: { fr: 'Nom complet', en: 'Full name' }, required: true },
        { name: 'phone', type: 'text', label: { fr: 'Téléphone / WhatsApp', en: 'Phone / WhatsApp' }, required: true },
        { name: 'email', type: 'email', label: 'E-mail' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', label: { fr: 'Ville', en: 'City' } },
        {
          name: 'preferredContact',
          type: 'select',
          label: { fr: 'Contact préféré', en: 'Preferred contact' },
          options: [
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: { fr: 'Appel', en: 'Call' }, value: 'appel' },
            { label: 'E-mail', value: 'email' },
          ],
        },
        { name: 'pole', type: 'relationship', relationTo: 'poles', label: { fr: 'Pôle concerné', en: 'Division' } },
      ],
    },
    { name: 'subject', type: 'text', label: { fr: 'Objet', en: 'Subject' }, required: true },
    { name: 'message', type: 'textarea', label: 'Message', required: true },
    {
      type: 'row',
      fields: [
        { name: 'locale', type: 'text', label: { fr: 'Langue', en: 'Language' }, admin: { readOnly: true } },
        { name: 'sourcePage', type: 'text', label: { fr: 'Page d’origine', en: 'Source page' }, admin: { readOnly: true } },
        {
          name: 'consent',
          type: 'checkbox',
          label: { fr: 'Consentement données', en: 'Data consent' },
          admin: { readOnly: true },
        },
      ],
    },
  ],
}
