import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, isAdminField, isStaffOrSelf, ROLES } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { fr: 'Utilisateur', en: 'User' },
    plural: { fr: 'Utilisateurs', en: 'Users' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
    group: { fr: 'Administration', en: 'Administration' },
  },
  auth: {
    // Protection contre les attaques par force brute
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    tokenExpiration: 60 * 60 * 8, // 8 heures
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    // Seuls l'admin et l'équipe entrent dans le back-office ; les clients auront leur propre espace
    admin: ({ req }) => hasRole(req, 'admin', 'equipe'),
    read: isStaffOrSelf,
    create: isAdmin,
    update: isStaffOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // Le tout premier compte créé (écran « Créer le premier utilisateur ») devient administrateur
      async ({ req, operation, data }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) return { ...data, role: 'admin' }
        return data
      },
    ],
  },
  fields: [
    // Le champ e-mail et le mot de passe (haché) sont ajoutés automatiquement par Payload
    {
      name: 'name',
      type: 'text',
      label: { fr: 'Nom complet', en: 'Full name' },
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: { fr: 'Téléphone / WhatsApp', en: 'Phone / WhatsApp' },
      admin: { description: { fr: 'Format international, ex. +224 620 00 00 00', en: 'International format' } },
    },
    {
      name: 'role',
      type: 'select',
      label: { fr: 'Rôle', en: 'Role' },
      required: true,
      defaultValue: 'client',
      saveToJWT: true, // le rôle est lu sans requête supplémentaire à chaque appel
      options: ROLES.map((value) => ({
        value,
        label: {
          admin: { fr: 'Administrateur', en: 'Administrator' },
          equipe: { fr: 'Équipe', en: 'Team' },
          client: { fr: 'Client', en: 'Client' },
        }[value],
      })),
      access: {
        // Un utilisateur ne peut pas s'attribuer lui-même un rôle plus élevé
        create: isAdminField,
        update: isAdminField,
      },
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
