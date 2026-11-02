/**
 * Description de chaque type de demande (un par service du cahier des charges, section 6.4).
 * Le même moteur de formulaire, la même validation et les mêmes e-mails s'appuient sur ces
 * définitions : ajouter un champ ici suffit à l'afficher, le valider et l'envoyer.
 *
 * Les libellés sont dans messages/*.json, section « Requests.fields » et « Requests.options ».
 */

export const REQUEST_SERVICES = [
  'architecture',
  'peinture',
  'calligraphie',
  'serigraphie',
  'dessin',
  'formation',
  'boutique',
  'prestation',
  'simulateur',
  'contact',
] as const
export type RequestService = (typeof REQUEST_SERVICES)[number]

/** Services proposés sur la page « Demander un devis » (boutique, formation et contact ont leurs pages). */
export const QUOTE_SERVICES = [
  'architecture',
  'peinture',
  'calligraphie',
  'serigraphie',
  'dessin',
  'prestation',
] as const
export type QuoteService = (typeof QUOTE_SERVICES)[number]

/** `hidden: true` : champ validé par le serveur mais rempli par un composant de la page (ex. le simulateur) */
type Hidden = { hidden?: boolean }

export type FieldDef = Hidden &
  (
    | { name: string; type: 'text'; required?: boolean; max?: number }
    | { name: string; type: 'textarea'; required?: boolean; max?: number }
    | {
        name: string
        type: 'number'
        required?: boolean
        min?: number
        max?: number
        unit?: string
      }
    | { name: string; type: 'date'; required?: boolean }
    | { name: string; type: 'select'; required?: boolean; options: readonly string[] }
    | { name: string; type: 'checkboxes'; required?: boolean; options: readonly string[] }
    | { name: string; type: 'checkbox' }
    | { name: string; type: 'files'; required?: boolean; accept: string; maxFiles: number }
  )

export type ServiceDef = {
  /** Pôle concerné (pour relier la demande au bon pôle dans le back-office) */
  pole?: string
  fields: readonly FieldDef[]
  /** Afficher « mode de réception » (retrait, livraison, intervention sur site) */
  reception: boolean
  /** Champ utilisé dans l'objet de l'e-mail, ex. « Demande de projet – villa » */
  subjectField?: string
}

const IMAGES_PDF = 'image/jpeg,image/png,image/webp,application/pdf'
const PRINT_FILES =
  'image/jpeg,image/png,image/webp,application/pdf,image/svg+xml,application/postscript,application/zip'

export const SERVICES: Record<RequestService, ServiceDef> = {
  architecture: {
    pole: 'architecture',
    reception: false,
    subjectField: 'projectType',
    fields: [
      {
        name: 'projectType',
        type: 'select',
        required: true,
        options: [
          'villa',
          'immeuble',
          'commerce',
          'institutionnel',
          'renovation',
          'interieur',
          'mobilier',
        ],
      },
      { name: 'location', type: 'text', required: true, max: 200 },
      { name: 'surface', type: 'number', min: 1, max: 100000, unit: 'm²' },
      { name: 'budget', type: 'text', max: 120 },
      { name: 'deadline', type: 'text', max: 120 },
      {
        name: 'deliverables',
        type: 'checkboxes',
        options: ['plans', 'modele3d', 'suivi', 'realisation'],
      },
      { name: 'files', type: 'files', accept: IMAGES_PDF, maxFiles: 5 },
    ],
  },
  peinture: {
    pole: 'peinture',
    reception: false,
    subjectField: 'surfaceType',
    fields: [
      {
        name: 'surfaceType',
        type: 'select',
        required: true,
        options: ['interieur', 'exterieur', 'interieurExterieur'],
      },
      { name: 'area', type: 'number', required: true, min: 1, max: 100000, unit: 'm²' },
      { name: 'rooms', type: 'number', min: 0, max: 500 },
      { name: 'wallCondition', type: 'select', options: ['bon', 'moyen', 'degrade'] },
      { name: 'products', type: 'text', max: 300 },
      { name: 'startDate', type: 'date' },
      { name: 'files', type: 'files', accept: IMAGES_PDF, maxFiles: 5 },
    ],
  },
  calligraphie: {
    pole: 'calligraphie',
    reception: true,
    fields: [
      {
        name: 'kind',
        type: 'select',
        required: true,
        options: ['tableau', 'enseigne', 'mural', 'ceremonie'],
      },
      { name: 'script', type: 'select', required: true, options: ['arabe', 'latin'] },
      { name: 'text', type: 'textarea', required: true, max: 2000 },
      { name: 'dimensions', type: 'text', max: 120 },
      { name: 'support', type: 'text', max: 120 },
      { name: 'style', type: 'text', max: 200 },
      { name: 'deliveryDate', type: 'date' },
    ],
  },
  serigraphie: {
    pole: 'serigraphie',
    reception: true,
    subjectField: 'support',
    fields: [
      {
        name: 'support',
        type: 'select',
        required: true,
        options: ['textile', 'affiche', 'bache', 'carte', 'autocollant', 'cachet'],
      },
      { name: 'width', type: 'number', min: 1, max: 10000, unit: 'cm' },
      { name: 'height', type: 'number', min: 1, max: 10000, unit: 'cm' },
      { name: 'quantity', type: 'number', required: true, min: 1, max: 1000000 },
      { name: 'colors', type: 'text', max: 200 },
      { name: 'files', type: 'files', accept: PRINT_FILES, maxFiles: 3 },
      { name: 'proof', type: 'checkbox' },
      { name: 'deadline', type: 'date' },
    ],
  },
  dessin: {
    pole: 'dessin',
    reception: true,
    fields: [
      {
        name: 'kind',
        type: 'select',
        required: true,
        options: ['portrait', 'illustration', 'architecture'],
      },
      { name: 'format', type: 'text', max: 120 },
      {
        name: 'technique',
        type: 'select',
        options: ['fusain', 'crayon', 'aquarelle', 'peinture', 'numerique'],
      },
      { name: 'usage', type: 'select', options: ['cadeau', 'decoration', 'professionnel'] },
      { name: 'files', type: 'files', accept: IMAGES_PDF, maxFiles: 3 },
      { name: 'deadline', type: 'date' },
    ],
  },
  formation: {
    pole: 'formation',
    reception: false,
    fields: [
      // La session est un champ spécial (liste lue en base), géré par le formulaire d'inscription
      {
        name: 'level',
        type: 'select',
        required: true,
        options: ['debutant', 'intermediaire', 'avance'],
      },
      { name: 'profession', type: 'text', max: 120 },
      { name: 'goal', type: 'textarea', max: 1000 },
      { name: 'paymentPlan', type: 'select', required: true, options: ['surPlace', 'echelonne'] },
    ],
  },
  boutique: { pole: 'commerce', reception: true, fields: [] },
  prestation: {
    pole: 'prestation',
    reception: false,
    subjectField: 'nature',
    fields: [
      {
        name: 'nature',
        type: 'select',
        required: true,
        options: ['etude', 'suivi', 'conseil', 'assistance'],
      },
      { name: 'description', type: 'textarea', required: true, max: 3000 },
      { name: 'location', type: 'text', max: 200 },
      { name: 'urgency', type: 'select', options: ['normale', 'urgente'] },
    ],
  },
  simulateur: {
    pole: 'architecture',
    reception: false,
    subjectField: 'simType',
    fields: [
      {
        name: 'simType',
        type: 'select',
        required: true,
        hidden: true,
        options: ['villa', 'immeuble', 'commerce', 'bureaux', 'renovation', 'interieur'],
      },
      {
        name: 'simSurface',
        type: 'number',
        required: true,
        hidden: true,
        min: 1,
        max: 100000,
        unit: 'm²',
      },
      {
        name: 'simFinish',
        type: 'select',
        required: true,
        hidden: true,
        options: ['economique', 'standard', 'hautDeGamme'],
      },
      {
        name: 'simZone',
        type: 'select',
        required: true,
        hidden: true,
        options: ['conakry', 'interieur', 'sousRegion'],
      },
    ],
  },
  contact: { reception: false, fields: [] },
}

/** Champs communs à toutes les demandes (cahier des charges 6.4, « Informations communes »). */
export const RECEPTION_MODES = ['retrait', 'livraison', 'surSite'] as const
export const PAYMENT_MODES = [
  'especes',
  'mobileMoney',
  'virement',
  'aLaLivraison',
  'surPlace',
] as const
export const CONTACT_MODES = ['whatsapp', 'appel', 'email'] as const

export const ORDER_STATUSES = ['nouvelle', 'contactee', 'confirmee', 'livree', 'annulee'] as const

/**
 * Limites des fichiers joints, en Mo. 10 Mo par fichier par défaut (fichiers d'impression,
 * connexions lentes). Sur Vercel, une requête ne peut pas dépasser 4,5 Mo : y régler
 * NEXT_PUBLIC_UPLOAD_FILE_MB=4 et NEXT_PUBLIC_UPLOAD_TOTAL_MB=4.
 */
export const UPLOAD_LIMITS = {
  fileMB: Number(process.env.NEXT_PUBLIC_UPLOAD_FILE_MB) || 10,
  totalMB: Number(process.env.NEXT_PUBLIC_UPLOAD_TOTAL_MB) || 50,
}
export const MAX_FILE_SIZE = UPLOAD_LIMITS.fileMB * 1024 * 1024
export const MAX_TOTAL_SIZE = UPLOAD_LIMITS.totalMB * 1024 * 1024

export function isRequestService(value: unknown): value is RequestService {
  return typeof value === 'string' && (REQUEST_SERVICES as readonly string[]).includes(value)
}
