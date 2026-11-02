import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ClientFiles } from './collections/ClientFiles'
import { ClientProjects } from './collections/ClientProjects'
import { ContactMessages } from './collections/ContactMessages'
import { EmailTemplates } from './collections/EmailTemplates'
import { Media } from './collections/Media'
import { Models3D } from './collections/Models3D'
import { OrderFiles } from './collections/OrderFiles'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Poles } from './collections/Poles'
import { Products } from './collections/Products'
import { ProjectMessages } from './collections/ProjectMessages'
import { Projects } from './collections/Projects'
import { ProjectUpdates } from './collections/ProjectUpdates'
import { TeamMembers } from './collections/TeamMembers'
import { Testimonials } from './collections/Testimonials'
import { Trainings } from './collections/Trainings'
import { TrainingSessions } from './collections/TrainingSessions'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { ImpactPage } from './globals/ImpactPage'
import { KeyFigures } from './globals/KeyFigures'
import { PrintPricing } from './globals/PrintPricing'
import { SimulatorPricing } from './globals/SimulatorPricing'
import { SiteSettings } from './globals/SiteSettings'
import { emailFrom, getTransporter, smtpConfigured } from './lib/email/transport'

/**
 * Connexion PostgreSQL. DATABASE_URL en priorité ; POSTGRES_URL est le nom utilisé par certaines
 * intégrations Vercel (Neon, Vercel Postgres).
 */
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
if (!databaseUrl && process.env.VERCEL) {
  // Message explicite plutôt qu'une tentative de connexion à 127.0.0.1 incompréhensible
  throw new Error(
    'Base de données non configurée : ajoutez DATABASE_URL dans Vercel › Settings › Environment Variables ' +
      '(ou reliez une base Neon dans l’onglet Storage), puis relancez le déploiement.',
  )
}

if (!process.env.PAYLOAD_SECRET && process.env.VERCEL) {
  throw new Error(
    'Clé secrète absente : ajoutez PAYLOAD_SECRET dans Vercel › Settings › Environment Variables ' +
      '(environnements Production, Preview et Development), puis relancez le déploiement.',
  )
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · ARCHI-DESIGN',
    },
  },
  // Langue de l'interface d'administration : français par défaut
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },
  // Langues du contenu : chaque champ « localized » existe en français et en anglais
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true, // un texte non traduit s'affiche en français
  },
  collections: [
    // Demandes en premier : c'est ce que l'équipe consulte le plus
    Orders,
    ContactMessages,
    OrderFiles,
    EmailTemplates,
    ClientProjects,
    ProjectUpdates,
    ClientFiles,
    ProjectMessages,
    Poles,
    Projects,
    Testimonials,
    TeamMembers,
    Partners,
    Pages,
    Media,
    Models3D,
    Products,
    Trainings,
    TrainingSessions,
    Users,
  ],
  globals: [SiteSettings, KeyFigures, AboutPage, ImpactPage, PrintPricing, SimulatorPricing],
  // E-mails du back-office (mot de passe oublié…) par le même serveur SMTP que les demandes
  ...(smtpConfigured
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: emailFrom.address,
          defaultFromName: emailFrom.name,
          transport: getTransporter(),
        }),
      }
    : {}),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    // En développement, le schéma est synchronisé automatiquement ;
    // en production, on applique les migrations versionnées de ce dossier.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    /*
     * Stockage des fichiers sur Vercel Blob quand BLOB_READ_WRITE_TOKEN est défini (hébergement Vercel).
     * Sans jeton (développement, serveur LWS), les fichiers restent sur le disque du serveur.
     */
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Même schéma de base avec ou sans Blob : les migrations restent valables partout
      alwaysInsertFields: true,
      // Envoi direct du navigateur vers Blob depuis le back-office (contourne la limite de 4,5 Mo de Vercel)
      clientUploads: true,
      collections: {
        // Fichiers publics : servis directement par le CDN de Vercel
        media: { disablePayloadAccessControl: true },
        models: { disablePayloadAccessControl: true },
        // Fichiers privés : toujours servis à travers Payload, qui vérifie les droits ;
        // noms aléatoires pour que l'adresse de stockage soit impossible à deviner
        'order-files': { prefix: 'prive/demandes' },
        'client-files': { prefix: 'prive/clients' },
      },
      addRandomSuffix: true,
    }),
  ],
})
