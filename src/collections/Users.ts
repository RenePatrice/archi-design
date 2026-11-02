import type { Access, CollectionConfig, Where } from 'payload'

import { hasRole, isAdmin, isAdminField, isStaff, isStaffOrSelf, ROLES } from '../access/roles'
import { siteUrl } from '../lib/seo'

/**
 * Modification d'un compte : l'administrateur modifie tout ; l'équipe modifie les comptes clients
 * et le sien (jamais celui d'un administrateur) ; un client ne modifie que le sien.
 */
const updateUser: Access = ({ req }) => {
  if (hasRole(req, 'admin')) return true
  if (!req.user) return false
  const self: Where = { id: { equals: req.user.id } }
  if (hasRole(req, 'equipe')) return { or: [self, { role: { equals: 'client' } }] }
  return self
}

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
    forgotPassword: {
      // Les clients sont renvoyés vers leur espace sur le site, l'équipe vers le back-office
      generateEmailSubject: () => '[ARCHI-DESIGN] Réinitialisation de votre mot de passe',
      generateEmailHTML: (args) => {
        const token = args?.token ?? ''
        const user = args?.user as { name?: string; role?: string; locale?: string } | undefined
        const en = user?.locale === 'en'
        const url =
          user?.role === 'client'
            ? `${siteUrl}${en ? '/en' : ''}/espace-client/mot-de-passe?token=${encodeURIComponent(token)}`
            : `${siteUrl}/admin/reset/${encodeURIComponent(token)}`
        const hello = en ? `Hello${user?.name ? ` ${user.name}` : ''},` : `Bonjour${user?.name ? ` ${user.name}` : ''},`
        const body = en
          ? 'You asked to reset your ARCHI-DESIGN password. This link is valid for one hour:'
          : 'Vous avez demandé à réinitialiser votre mot de passe ARCHI-DESIGN. Ce lien est valable une heure :'
        const ignore = en ? 'If you did not ask for this, ignore this e-mail.' : 'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.'
        return `<p>${hello}</p><p>${body}</p><p><a href="${url}" style="background:#A0521E;color:#fff;padding:12px 18px;text-decoration:none;font-weight:bold;display:inline-block">${en ? 'Choose a new password' : 'Choisir un nouveau mot de passe'}</a></p><p style="color:#4E5752;font-size:13px">${ignore}</p>`
      },
    },
  },
  access: {
    // Seuls l'admin et l'équipe entrent dans le back-office ; les clients auront leur propre espace
    admin: ({ req }) => hasRole(req, 'admin', 'equipe'),
    read: isStaffOrSelf,
    // L'équipe crée les comptes clients (le rôle reste « client » : seul l'admin peut le changer)
    create: isStaff,
    update: updateUser,
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
      name: 'locale',
      type: 'select',
      label: { fr: 'Langue des e-mails', en: 'E-mail language' },
      defaultValue: 'fr',
      options: [
        { value: 'fr', label: 'Français' },
        { value: 'en', label: 'English' },
      ],
      admin: { position: 'sidebar' },
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
