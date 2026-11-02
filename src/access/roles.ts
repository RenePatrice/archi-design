import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Rôles de l'application :
 * - admin  : accès complet, gère les comptes et les réglages
 * - equipe : gère le contenu et les commandes depuis le back-office
 * - client : accède uniquement à son espace client (phase 5)
 */
export const ROLES = ['admin', 'equipe', 'client'] as const
export type Role = (typeof ROLES)[number]

type UserWithRole = { id: number | string; role?: Role | null }

/** Rôle de l'utilisateur connecté, ou null pour un visiteur anonyme. */
export const getRole = (req: PayloadRequest): Role | null =>
  ((req.user as UserWithRole | null)?.role as Role | undefined) ?? null

export const hasRole = (req: PayloadRequest, ...roles: Role[]): boolean => {
  const role = getRole(req)
  return role !== null && roles.includes(role)
}

/** Réservé aux administrateurs. */
export const isAdmin: Access = ({ req }) => hasRole(req, 'admin')

/** Administrateurs et membres de l'équipe (back-office). */
export const isStaff: Access = ({ req }) => hasRole(req, 'admin', 'equipe')

/** Lecture publique (contenus du site vitrine). */
export const anyone: Access = () => true

/**
 * L'équipe voit tout ; un client ne voit que son propre compte.
 * Renvoie une contrainte `where` que Payload applique à la requête.
 */
export const isStaffOrSelf: Access = ({ req }) => {
  if (hasRole(req, 'admin', 'equipe')) return true
  if (req.user) return { id: { equals: req.user.id } }
  return false
}

/** Accès à un champ réservé aux administrateurs (ex. changer un rôle). */
export const isAdminField: FieldAccess = ({ req }) => hasRole(req, 'admin')
