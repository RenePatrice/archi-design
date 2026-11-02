import type { CollectionConfig } from 'payload'

import { hasRole, isStaff } from '../access/roles'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/** Types de projet utilisés par les filtres du portfolio. */
export const PROJECT_TYPES = [
  { value: 'residentiel', label: { fr: 'Résidentiel', en: 'Residential' } },
  { value: 'commercial', label: { fr: 'Commercial', en: 'Commercial' } },
  { value: 'institutionnel', label: { fr: 'Institutionnel', en: 'Institutional' } },
  { value: 'renovation', label: { fr: 'Rénovation', en: 'Renovation' } },
  { value: 'interieur', label: { fr: 'Intérieur', en: 'Interior' } },
  { value: 'mobilier', label: { fr: 'Mobilier', en: 'Furniture' } },
  { value: 'decoratif', label: { fr: 'Décoration et art', en: 'Decoration and art' } },
  { value: 'signaletique', label: { fr: 'Signalétique', en: 'Signage' } },
] as const

/**
 * Réalisations (portfolio). Un projet est visible sur le site seulement une fois publié ;
 * les brouillons restent dans le back-office.
 */
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: { fr: 'Réalisation', en: 'Project' },
    plural: { fr: 'Réalisations', en: 'Projects' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pole', 'city', 'year', 'featured', '_status'],
    group: { fr: 'Contenu', en: 'Content' },
  },
  defaultSort: '-year',
  versions: { drafts: true },
  access: {
    // Le public ne voit que les projets publiés ; l'équipe voit aussi les brouillons
    read: ({ req }) => (hasRole(req, 'admin', 'equipe') ? true : { _status: { equals: 'published' } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', label: { fr: 'Titre', en: 'Title' }, required: true, localized: true },
    slugField(),
    {
      name: 'featured',
      type: 'checkbox',
      label: { fr: 'Projet phare (accueil)', en: 'Featured on home page' },
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Présentation', en: 'Overview' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pole',
                  type: 'relationship',
                  relationTo: 'poles',
                  label: { fr: 'Pôle principal', en: 'Main division' },
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  label: { fr: 'Type de projet', en: 'Project type' },
                  required: true,
                  options: PROJECT_TYPES.map((t) => ({ value: t.value, label: t.label })),
                },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: { fr: 'Résumé (affiché sur les cartes)', en: 'Summary' },
              required: true,
              localized: true,
            },
            { name: 'description', type: 'richText', label: { fr: 'Description', en: 'Description' }, localized: true },
            {
              name: 'clientQuote',
              type: 'textarea',
              label: { fr: 'Mot du client', en: 'Client quote' },
              localized: true,
            },
          ],
        },
        {
          label: { fr: 'Fiche technique', en: 'Technical sheet' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', label: { fr: 'Ville', en: 'City' }, required: true },
                { name: 'country', type: 'text', label: { fr: 'Pays', en: 'Country' }, defaultValue: 'Guinée' },
                { name: 'year', type: 'number', label: { fr: 'Année', en: 'Year' }, required: true, min: 1990, max: 2100 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'surface', type: 'number', label: { fr: 'Surface (m²)', en: 'Area (m²)' }, min: 0 },
                { name: 'duration', type: 'text', label: { fr: 'Durée', en: 'Duration' }, localized: true },
                {
                  name: 'budgetRange',
                  type: 'text',
                  label: { fr: 'Budget indicatif', en: 'Indicative budget' },
                  localized: true,
                },
              ],
            },
            {
              name: 'materials',
              type: 'array',
              label: { fr: 'Matériaux', en: 'Materials' },
              labels: { singular: { fr: 'Matériau', en: 'Material' }, plural: { fr: 'Matériaux', en: 'Materials' } },
              fields: [{ name: 'name', type: 'text', label: { fr: 'Matériau', en: 'Material' }, required: true, localized: true }],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  label: 'Latitude',
                  admin: { description: { fr: 'Pour la carte des réalisations, ex. 9.6412', en: 'For the map' } },
                },
                { name: 'longitude', type: 'number', label: 'Longitude' },
              ],
            },
          ],
        },
        {
          label: { fr: 'Images', en: 'Images' },
          fields: [
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              label: { fr: 'Image principale', en: 'Cover image' },
              required: true,
            },
            {
              name: 'gallery',
              type: 'array',
              label: { fr: 'Galerie', en: 'Gallery' },
              labels: { singular: { fr: 'Image', en: 'Image' }, plural: { fr: 'Images', en: 'Images' } },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
            {
              type: 'row',
              fields: [
                { name: 'beforeImage', type: 'upload', relationTo: 'media', label: { fr: 'Avant', en: 'Before' } },
                { name: 'afterImage', type: 'upload', relationTo: 'media', label: { fr: 'Après', en: 'After' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
