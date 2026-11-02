import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { ContactMessages } from './collections/ContactMessages'
import { EmailTemplates } from './collections/EmailTemplates'
import { Media } from './collections/Media'
import { OrderFiles } from './collections/OrderFiles'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Poles } from './collections/Poles'
import { Products } from './collections/Products'
import { Projects } from './collections/Projects'
import { TeamMembers } from './collections/TeamMembers'
import { Testimonials } from './collections/Testimonials'
import { Trainings } from './collections/Trainings'
import { TrainingSessions } from './collections/TrainingSessions'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { KeyFigures } from './globals/KeyFigures'
import { PrintPricing } from './globals/PrintPricing'
import { SiteSettings } from './globals/SiteSettings'
import { emailFrom, getTransporter, smtpConfigured } from './lib/email/transport'

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
    Poles,
    Projects,
    Testimonials,
    TeamMembers,
    Partners,
    Pages,
    Media,
    Products,
    Trainings,
    TrainingSessions,
    Users,
  ],
  globals: [SiteSettings, KeyFigures, AboutPage, PrintPricing],
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
      connectionString: process.env.DATABASE_URL || '',
    },
    // En développement, le schéma est synchronisé automatiquement ;
    // en production, on applique les migrations versionnées de ce dossier.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [],
})
