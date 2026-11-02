import type { CollectionConfig } from 'payload'

import { hasRole, isStaff } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const PRODUCT_CATEGORIES = ['peinture', 'enduit', 'materiel', 'impression'] as const

/**
 * Catalogue de la boutique (commerce général). Pas de paiement en ligne :
 * le prix est indicatif, la commande part par e-mail et WhatsApp.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: { fr: 'Produit', en: 'Product' },
    plural: { fr: 'Produits', en: 'Products' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'reference', 'category', 'price', 'stock', '_status'],
    group: { fr: 'Boutique et formations', en: 'Shop and training' },
  },
  defaultSort: 'name',
  versions: { drafts: true },
  access: {
    read: ({ req }) => (hasRole(req, 'admin', 'equipe') ? true : { _status: { equals: 'published' } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'name', type: 'text', label: { fr: 'Nom', en: 'Name' }, required: true, localized: true },
    { ...slugField('name') },
    {
      type: 'row',
      fields: [
        { name: 'reference', type: 'text', label: { fr: 'Référence', en: 'SKU' }, required: true, unique: true },
        {
          name: 'category',
          type: 'select',
          label: { fr: 'Catégorie', en: 'Category' },
          required: true,
          options: [
            { value: 'peinture', label: { fr: 'Peintures', en: 'Paints' } },
            { value: 'enduit', label: { fr: 'Enduits', en: 'Renders' } },
            { value: 'materiel', label: { fr: 'Matériel de construction', en: 'Building materials' } },
            { value: 'impression', label: { fr: 'Outils d’impression', en: 'Printing tools' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: { fr: 'Prix indicatif (GNF)', en: 'Indicative price (GNF)' },
          required: true,
          min: 0,
        },
        {
          name: 'unit',
          type: 'text',
          label: { fr: 'Unité', en: 'Unit' },
          required: true,
          localized: true,
          admin: { description: { fr: 'ex. pot de 20 L, sac de 25 kg, pièce', en: 'e.g. 20 L can, 25 kg bag' } },
        },
        {
          name: 'stock',
          type: 'number',
          label: { fr: 'Stock', en: 'Stock' },
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              fr: 'À 0, le produit reste commandable avec la mention « sur commande ».',
              en: 'At 0 the product stays orderable as “made to order”.',
            },
          },
        },
      ],
    },
    {
      name: 'colorHex',
      type: 'text',
      label: { fr: 'Teinte (code couleur)', en: 'Colour (hex)' },
      admin: {
        condition: (data) => data?.category === 'peinture',
        description: { fr: 'Pour les peintures, ex. #C9A27E. Sert aussi au futur configurateur.', en: 'For paints.' },
      },
      validate: (value: string | null | undefined) => !value || /^#[0-9a-f]{6}$/i.test(value) || 'Format attendu : #RRGGBB',
    },
    { name: 'summary', type: 'textarea', label: { fr: 'Description courte', en: 'Short description' }, localized: true },
    { name: 'technicalSheet', type: 'richText', label: { fr: 'Fiche technique', en: 'Technical sheet' }, localized: true },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: { fr: 'Images', en: 'Images' },
    },
  ],
}
