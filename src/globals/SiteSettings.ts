import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access/roles'

/**
 * Réglages généraux du site, modifiables sans toucher au code :
 * coordonnées, numéro WhatsApp, horaires et réseaux sociaux.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { fr: 'Réglages du site', en: 'Site settings' },
  admin: {
    group: { fr: 'Administration', en: 'Administration' },
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  hooks: {
    // Le site affiche les nouveaux réglages dès l'enregistrement
    afterChange: [
      async () => {
        try {
          const { revalidateTag } = await import('next/cache')
          revalidateTag('site-settings', 'max')
        } catch {
          // Hors de Next.js (script de seed, migrations) : il n'y a pas de cache à vider
        }
      },
    ],
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: { fr: 'Raison sociale', en: 'Company name' },
      defaultValue: 'ARCHI-DESIGN Guinée SARL',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      label: { fr: 'Signature', en: 'Tagline' },
      localized: true,
      defaultValue: 'Construire mieux avec les ressources et les réalités de notre territoire.',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'whatsappNumber',
          type: 'text',
          label: { fr: 'Numéro WhatsApp', en: 'WhatsApp number' },
          admin: {
            description: {
              fr: 'Chiffres uniquement, avec l’indicatif pays, ex. 224620000000',
              en: 'Digits only, with country code',
            },
          },
          validate: (value: string | null | undefined) =>
            !value || /^\d{8,15}$/.test(value) || 'Chiffres uniquement, indicatif compris (8 à 15 chiffres).',
        },
        {
          name: 'phone',
          type: 'text',
          label: { fr: 'Téléphone', en: 'Phone' },
        },
        {
          name: 'email',
          type: 'email',
          label: { fr: 'E-mail de contact', en: 'Contact e-mail' },
        },
      ],
    },
    {
      name: 'defaultInbox',
      type: 'email',
      label: { fr: 'Boîte de réception par défaut des demandes', en: 'Default requests inbox' },
      admin: {
        description: {
          fr: 'Reçoit les demandes des services qui n’ont pas d’adresse propre dans « Modèles d’e-mail ».',
          en: 'Receives requests for services without their own address.',
        },
      },
      access: {
        // Adresse interne : jamais exposée sur le site public
        read: ({ req }) => Boolean(req.user),
      },
    },
    {
      name: 'address',
      type: 'textarea',
      label: { fr: 'Adresse', en: 'Address' },
      defaultValue: 'Conakry, Guinée',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          label: { fr: 'Latitude du siège', en: 'Office latitude' },
          admin: { description: { fr: 'Pour la carte de la page Contact, ex. 9.5370', en: 'For the contact map' } },
        },
        { name: 'longitude', type: 'number', label: { fr: 'Longitude du siège', en: 'Office longitude' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'rccm', type: 'text', label: 'RCCM' },
        { name: 'nif', type: 'text', label: 'NIF' },
      ],
    },
    {
      name: 'openingHours',
      type: 'text',
      label: { fr: 'Horaires', en: 'Opening hours' },
      localized: true,
      defaultValue: 'Lundi – samedi, 8 h 30 – 18 h',
    },
    {
      name: 'socials',
      type: 'array',
      label: { fr: 'Réseaux sociaux', en: 'Social networks' },
      labels: {
        singular: { fr: 'Réseau', en: 'Network' },
        plural: { fr: 'Réseaux', en: 'Networks' },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: { fr: 'Plateforme', en: 'Platform' },
              required: true,
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'YouTube', value: 'youtube' },
              ],
            },
            { name: 'url', type: 'text', label: 'URL', required: true },
          ],
        },
      ],
    },
  ],
}
