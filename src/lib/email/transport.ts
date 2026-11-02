import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Envoi des e-mails par le serveur SMTP de la messagerie LWS (ou tout autre serveur SMTP).
 *
 * Variables .env :
 *   SMTP_HOST      ex. mail.archidesignguinee.com  (voir l'espace client LWS)
 *   SMTP_PORT      465 (SSL) ou 587 (STARTTLS)
 *   SMTP_SECURE    true pour 465, false pour 587
 *   SMTP_USER      adresse complète de la boîte d'envoi
 *   SMTP_PASS      mot de passe de cette boîte
 *   EMAIL_FROM     adresse d'expédition (en général = SMTP_USER)
 *   EMAIL_FROM_NAME nom affiché, ex. ARCHI-DESIGN Guinée
 *
 * Sans SMTP_HOST (développement), les e-mails ne partent pas : ils sont enregistrés en HTML
 * dans le dossier .emails/ pour être ouverts dans un navigateur.
 */

export const emailFrom = {
  address: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost',
  name: process.env.EMAIL_FROM_NAME || 'ARCHI-DESIGN Guinée',
}

export const smtpConfigured = Boolean(process.env.SMTP_HOST)

let transporter: Transporter | null = null

export function getTransporter(): Transporter {
  if (transporter) return transporter
  transporter = smtpConfigured
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: (process.env.SMTP_SECURE ?? 'true') !== 'false',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        // Délais courts : on préfère réessayer plus tard que bloquer le serveur
        connectionTimeout: 15_000,
        greetingTimeout: 10_000,
        socketTimeout: 30_000,
      })
    : nodemailer.createTransport({ jsonTransport: true })
  return transporter
}

export type OutgoingEmail = {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  attachments?: { filename: string; path: string; contentType?: string }[]
}

/** Envoie un e-mail ; en développement sans SMTP, l'écrit dans .emails/ à la place. */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const message = { from: emailFrom, ...email }
  if (!smtpConfigured) {
    const dir = path.resolve(process.cwd(), '.emails')
    await mkdir(dir, { recursive: true })
    const safe = email.subject.replace(/[^\w-]+/g, '_').slice(0, 80)
    const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}_${safe}.html`)
    const header = `<!-- À : ${[email.to].flat().join(', ')} | Objet : ${email.subject} | Pièces jointes : ${email.attachments?.map((a) => a.filename).join(', ') || 'aucune'} -->\n`
    await writeFile(file, header + email.html, 'utf8')
    console.info(`[e-mail] SMTP non configuré : aperçu enregistré dans ${file}`)
    return
  }
  await getTransporter().sendMail(message)
}
