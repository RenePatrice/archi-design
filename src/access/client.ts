import type { Access, Where } from 'payload'

import { hasRole } from './roles'

/*
 * Règles d'accès de l'espace client.
 * L'équipe voit tout ; un client ne voit que les projets dont il fait partie
 * (et ce qui s'y rattache). Payload applique ces filtres à chaque requête,
 * y compris aux fichiers servis par /api/client-files/file/…
 */

/** Projets suivis : ceux dont l'utilisateur est l'un des clients. */
export const clientProjectRead: Access = ({ req }) => {
  if (hasRole(req, 'admin', 'equipe')) return true
  if (!req.user) return false
  return { clients: { equals: req.user.id } }
}

/** Éléments rattachés à un projet suivi (actualités, messages). */
export const viaClientProject: Access = ({ req }) => {
  if (hasRole(req, 'admin', 'equipe')) return true
  if (!req.user) return false
  return { 'clientProject.clients': { equals: req.user.id } }
}

/** Fichiers : en plus, l'équipe peut garder un fichier interne (non visible du client). */
export const clientFileRead: Access = ({ req }) => {
  if (hasRole(req, 'admin', 'equipe')) return true
  if (!req.user) return false
  const where: Where = {
    and: [{ 'clientProject.clients': { equals: req.user.id } }, { visibleToClient: { equals: true } }],
  }
  return where
}
