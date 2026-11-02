import { render } from '@react-email/render'
import type { CollectionAfterChangeHook, Payload } from 'payload'

import { ClientNotificationEmail } from '../emails/client-emails'
import { emailFrom, sendEmail } from '../lib/email/transport'
import { siteUrl } from '../lib/seo'

/*
 * Notifications de l'espace client.
 * Envoyées en arrière-plan (sans bloquer l'enregistrement dans le back-office) et ignorées
 * quand l'opération porte context.skipNotify (données de démonstration, imports).
 */

type Lang = 'fr' | 'en'

const texts = {
  fr: {
    update: { eyebrow: 'Actualité de chantier', intro: 'Une nouvelle actualité a été publiée sur votre projet.' },
    document: { eyebrow: 'Nouveau document', intro: 'Un nouveau document a été ajouté à votre espace client.' },
    message: { eyebrow: 'Nouveau message', intro: 'L’équipe ARCHI-DESIGN vous a répondu.' },
    button: 'Ouvrir mon espace client',
    footer: 'Vous recevez cet e-mail car vous suivez ce projet dans votre espace client ARCHI-DESIGN.',
  },
  en: {
    update: { eyebrow: 'Site update', intro: 'A new update has been posted on your project.' },
    document: { eyebrow: 'New document', intro: 'A new document has been added to your client area.' },
    message: { eyebrow: 'New message', intro: 'The ARCHI-DESIGN team has replied to you.' },
    button: 'Open my client area',
    footer: 'You receive this e-mail because you follow this project in your ARCHI-DESIGN client area.',
  },
}

const portalUrl = (lang: Lang, projectId: number | string) => `${siteUrl}${lang === 'fr' ? '' : '/en'}/espace-client/projets/${projectId}`

/** Exécute l'envoi sans faire attendre l'enregistrement ; les erreurs sont seulement journalisées. */
function inBackground(payload: Payload, label: string, task: () => Promise<void>) {
  task().catch((error) => payload.logger.error({ err: error }, `[espace client] Notification impossible (${label})`))
}

async function loadProject(payload: Payload, id: number | string) {
  return payload.findByID({ collection: 'client-projects', id, depth: 1, overrideAccess: true })
}

/** Prévient chaque client du projet, dans sa langue. */
async function emailClients(payload: Payload, projectId: number | string, kind: 'update' | 'document' | 'message', title: string, excerpt?: string | null) {
  const project = await loadProject(payload, projectId)
  for (const client of project.clients ?? []) {
    if (typeof client !== 'object' || !client.email) continue
    const lang: Lang = client.locale === 'en' ? 'en' : 'fr'
    const t = texts[lang]
    const element = ClientNotificationEmail({
      lang,
      eyebrow: `${t[kind].eyebrow} · ${project.title}`,
      title,
      intro: t[kind].intro,
      excerpt: excerpt ? excerpt.slice(0, 400) : null,
      buttonLabel: t.button,
      url: portalUrl(lang, project.id),
      footer: t.footer,
    })
    await sendEmail({
      to: client.email,
      subject: `[ARCHI-DESIGN] ${t[kind].eyebrow} – ${project.title}`,
      html: await render(element),
      text: await render(element, { plainText: true }),
    })
  }
}

/** Après la création d'une actualité ou d'un document : e-mail au client si demandé. */
export const notifyClientAfterChange =
  (kind: 'update' | 'document'): CollectionAfterChangeHook =>
  ({ doc, operation, req, context }) => {
    if (operation !== 'create' || context?.skipNotify || !doc.notifyClient) return doc
    if (kind === 'document' && doc.visibleToClient === false) return doc
    const projectId = typeof doc.clientProject === 'object' ? doc.clientProject.id : doc.clientProject
    inBackground(req.payload, kind, () => emailClients(req.payload, projectId, kind, doc.title, kind === 'update' ? doc.text : null))
    return doc
  }

/** Après un message : l'équipe écrit → e-mail au client ; le client écrit → e-mail à l'équipe. */
export const notifyMessageAfterChange: CollectionAfterChangeHook = ({ doc, operation, req, context }) => {
  if (operation !== 'create' || context?.skipNotify) return doc
  const projectId = typeof doc.clientProject === 'object' ? doc.clientProject.id : doc.clientProject

  if (doc.fromStaff) {
    inBackground(req.payload, 'message équipe', () =>
      emailClients(req.payload, projectId, 'message', texts.fr.message.eyebrow, doc.body),
    )
    return doc
  }

  inBackground(req.payload, 'message client', async () => {
    const payload = req.payload
    const project = await loadProject(payload, projectId)
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
    const manager = typeof project.manager === 'object' ? project.manager : null
    const to = manager?.email || settings.defaultInbox || emailFrom.address
    const author = typeof doc.author === 'object' ? doc.author : null
    const element = ClientNotificationEmail({
      lang: 'fr',
      eyebrow: `Message client · ${project.title}`,
      title: author?.name ? `${author.name} vous a écrit` : 'Nouveau message d’un client',
      intro: 'Un client a écrit depuis son espace. Répondez depuis le back-office (onglet Messages du projet suivi).',
      excerpt: doc.body,
      buttonLabel: 'Ouvrir le projet dans le back-office',
      url: `${siteUrl}/admin/collections/client-projects/${project.id}`,
      footer: 'Notification automatique de l’espace client.',
    })
    await sendEmail({
      to,
      subject: `[ARCHI-DESIGN] Message client – ${project.title}`,
      html: await render(element),
      text: await render(element, { plainText: true }),
      replyTo: author?.email,
    })
  })
  return doc
}
