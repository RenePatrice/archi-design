import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '../access/roles'
import { ORDER_STATUSES, REQUEST_SERVICES } from '../lib/requests/services'

const serviceLabels: Record<string, { fr: string; en: string }> = {
  architecture: { fr: 'Architecture et design', en: 'Architecture' },
  peinture: { fr: 'Peinture', en: 'Painting' },
  calligraphie: { fr: 'Calligraphie', en: 'Calligraphy' },
  serigraphie: { fr: 'Sérigraphie et impression', en: 'Printing' },
  dessin: { fr: 'Dessin d’art', en: 'Drawing' },
  formation: { fr: 'Inscription formation', en: 'Training enrolment' },
  boutique: { fr: 'Commande boutique', en: 'Shop order' },
  prestation: { fr: 'Prestation de services', en: 'Consulting' },
  simulateur: { fr: 'Simulateur (pré-devis)', en: 'Simulator (pre-quote)' },
  contact: { fr: 'Contact', en: 'Contact' },
}

const statusLabels: Record<(typeof ORDER_STATUSES)[number], { fr: string; en: string }> = {
  nouvelle: { fr: 'Nouvelle', en: 'New' },
  contactee: { fr: 'Contactée', en: 'Contacted' },
  confirmee: { fr: 'Confirmée', en: 'Confirmed' },
  livree: { fr: 'Livrée / réalisée', en: 'Delivered' },
  annulee: { fr: 'Annulée', en: 'Cancelled' },
}

const deliveryStatus = [
  { value: 'attente', label: { fr: 'En attente', en: 'Pending' } },
  { value: 'envoye', label: { fr: 'Envoyé', en: 'Sent' } },
  { value: 'echec', label: { fr: 'Échec', en: 'Failed' } },
  { value: 'sansEmail', label: { fr: 'Pas d’e-mail client', en: 'No customer e-mail' } },
]

/**
 * Commandes et demandes : devis, commandes boutique, impressions, inscriptions.
 * Chaque demande du site est enregistrée ici AVANT l'envoi des e-mails : rien n'est perdu
 * si la messagerie est indisponible. L'équipe suit le statut de « Nouvelle » à « Livrée ».
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: { fr: 'Commande / demande', en: 'Order / request' },
    plural: { fr: 'Commandes et demandes', en: 'Orders and requests' },
  },
  admin: {
    useAsTitle: 'number',
    defaultColumns: ['number', 'service', 'customerName', 'customerPhone', 'status', 'createdAt'],
    listSearchableFields: ['number', 'customerName', 'customerPhone', 'customerEmail'],
    group: { fr: 'Demandes', en: 'Requests' },
  },
  defaultSort: '-createdAt',
  access: {
    read: isStaff,
    create: () => false, // uniquement via les formulaires du site (API locale)
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'number',
      type: 'text',
      label: { fr: 'Numéro', en: 'Number' },
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: { fr: 'Statut', en: 'Status' },
      required: true,
      defaultValue: 'nouvelle',
      options: ORDER_STATUSES.map((value) => ({ value, label: statusLabels[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'service',
      type: 'select',
      label: { fr: 'Service', en: 'Service' },
      required: true,
      options: REQUEST_SERVICES.map((value) => ({ value, label: serviceLabels[value] })),
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'pole', type: 'relationship', relationTo: 'poles', label: { fr: 'Pôle', en: 'Division' }, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'internalNotes', type: 'textarea', label: { fr: 'Notes internes', en: 'Internal notes' }, admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Client', en: 'Customer' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'customerName', type: 'text', label: { fr: 'Nom complet', en: 'Full name' }, required: true },
                { name: 'customerPhone', type: 'text', label: { fr: 'Téléphone / WhatsApp', en: 'Phone' }, required: true },
                { name: 'customerEmail', type: 'email', label: 'E-mail' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'customerCity', type: 'text', label: { fr: 'Ville', en: 'City' } },
                { name: 'customerAddress', type: 'text', label: { fr: 'Adresse', en: 'Address' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'preferredContact', type: 'text', label: { fr: 'Contact préféré', en: 'Preferred contact' } },
                { name: 'receptionMode', type: 'text', label: { fr: 'Mode de réception', en: 'Reception' } },
                { name: 'paymentMode', type: 'text', label: { fr: 'Règlement prévu', en: 'Payment' } },
              ],
            },
            { name: 'message', type: 'textarea', label: { fr: 'Message du client', en: 'Customer message' } },
            {
              type: 'row',
              fields: [
                { name: 'locale', type: 'text', label: { fr: 'Langue', en: 'Language' } },
                { name: 'consent', type: 'checkbox', label: { fr: 'Consentement données', en: 'Data consent' } },
              ],
            },
          ],
        },
        {
          label: { fr: 'Détail de la demande', en: 'Request details' },
          fields: [
            {
              // Copie lisible (en français) de tout ce que le client a saisi
              name: 'details',
              type: 'array',
              label: { fr: 'Informations saisies', en: 'Submitted information' },
              labels: { singular: { fr: 'Ligne', en: 'Row' }, plural: { fr: 'Lignes', en: 'Rows' } },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', label: { fr: 'Champ', en: 'Field' } },
                    { name: 'value', type: 'textarea', label: { fr: 'Valeur', en: 'Value' } },
                  ],
                },
              ],
            },
            {
              name: 'lines',
              type: 'array',
              label: { fr: 'Lignes de commande (boutique)', en: 'Order lines' },
              admin: { condition: (data) => data?.service === 'boutique' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'product', type: 'relationship', relationTo: 'products', label: { fr: 'Produit', en: 'Product' } },
                    { name: 'reference', type: 'text', label: { fr: 'Référence', en: 'SKU' } },
                    { name: 'name', type: 'text', label: { fr: 'Désignation', en: 'Name' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'quantity', type: 'number', label: { fr: 'Quantité', en: 'Qty' } },
                    { name: 'unitPrice', type: 'number', label: { fr: 'Prix unitaire (GNF)', en: 'Unit price' } },
                    { name: 'subtotal', type: 'number', label: { fr: 'Sous-total (GNF)', en: 'Subtotal' } },
                  ],
                },
              ],
            },
            {
              name: 'estimatedTotal',
              type: 'number',
              label: { fr: 'Total ou prix indicatif (GNF)', en: 'Indicative total (GNF)' },
            },
            {
              name: 'session',
              type: 'relationship',
              relationTo: 'training-sessions',
              label: { fr: 'Session de formation', en: 'Training session' },
              admin: { condition: (data) => data?.service === 'formation' },
            },
            {
              name: 'files',
              type: 'relationship',
              relationTo: 'order-files',
              hasMany: true,
              label: { fr: 'Fichiers joints', en: 'Attachments' },
            },
          ],
        },
        {
          label: { fr: 'Envoi des e-mails', en: 'E-mails' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'companyEmailStatus',
                  type: 'select',
                  label: { fr: 'E-mail à l’entreprise', en: 'Company e-mail' },
                  defaultValue: 'attente',
                  options: deliveryStatus,
                },
                {
                  name: 'customerEmailStatus',
                  type: 'select',
                  label: { fr: 'Accusé de réception', en: 'Acknowledgement' },
                  defaultValue: 'attente',
                  options: deliveryStatus,
                },
                { name: 'emailAttempts', type: 'number', label: { fr: 'Tentatives', en: 'Attempts' }, defaultValue: 0 },
              ],
            },
            { name: 'emailError', type: 'textarea', label: { fr: 'Dernière erreur', en: 'Last error' }, admin: { readOnly: true } },
          ],
        },
      ],
    },
  ],
}
