import { z } from 'zod'

import { CONTACT_MODES, PAYMENT_MODES, RECEPTION_MODES, type FieldDef, type ServiceDef } from './services'

/*
 * Validation des demandes, construite à partir des définitions de services.
 * Chaque message d'erreur est une clé de traduction de « Requests.errors ».
 */

export type RequestErrorKey =
  | 'required'
  | 'tooLong'
  | 'number'
  | 'date'
  | 'choice'
  | 'name'
  | 'phone'
  | 'email'
  | 'consent'
  | 'files'
  | 'fileType'
  | 'fileSize'
  | 'totalSize'
  | 'cart'
  | 'session'

const optionalText = (max = 500) => z.string().trim().max(max, 'tooLong').optional().default('')

/** Champs communs à toutes les demandes. */
export const commonSchema = z.object({
  name: z.string().trim().min(2, 'name').max(120, 'name'),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const digits = v.replace(/\D/g, '')
      return digits.length >= 8 && digits.length <= 15
    }, 'phone'),
  email: z
    .string()
    .trim()
    .max(200, 'email')
    .refine((v) => v === '' || z.email().safeParse(v).success, 'email')
    .optional()
    .default(''),
  city: z.string().trim().min(2, 'required').max(120, 'tooLong'),
  address: optionalText(300),
  preferredContact: z.enum(CONTACT_MODES).default('whatsapp'),
  receptionMode: z.enum([...RECEPTION_MODES, '']).optional().default(''),
  paymentMode: z.enum([...PAYMENT_MODES, '']).optional().default(''),
  message: optionalText(3000),
  consent: z.literal('on', { error: 'consent' }),
})

function fieldSchema(field: FieldDef): z.ZodType {
  switch (field.type) {
    case 'text':
    case 'textarea': {
      const base = z.string().trim().max(field.max ?? 500, 'tooLong')
      return field.required ? base.min(1, 'required') : base.optional().default('')
    }
    case 'number': {
      // Champ vide = non renseigné ; sinon un nombre dans les bornes
      const num = z.coerce
        .number({ error: 'number' })
        .min(field.min ?? 0, 'number')
        .max(field.max ?? Number.MAX_SAFE_INTEGER, 'number')
      return z.preprocess((v) => (v === '' || v == null ? undefined : v), field.required ? num : num.optional())
    }
    case 'date': {
      const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date')
      return z.preprocess((v) => (v === '' || v == null ? undefined : v), field.required ? date : date.optional())
    }
    case 'select': {
      const choice = z.enum(field.options as [string, ...string[]], { error: 'choice' })
      return z.preprocess((v) => (v === '' ? undefined : v), field.required ? choice : choice.optional())
    }
    case 'checkboxes': {
      const list = z.array(z.enum(field.options as [string, ...string[]], { error: 'choice' }))
      return field.required ? list.min(1, 'required') : list.default([])
    }
    case 'checkbox':
      return z.preprocess((v) => v === 'on', z.boolean())
    case 'files':
      // Les fichiers sont vérifiés à part (taille, type), voir validateFiles
      return z.any().optional()
  }
}

/** Schéma complet d'un service : champs communs + champs propres au service. */
export function buildRequestSchema(service: ServiceDef) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of service.fields) shape[field.name] = fieldSchema(field)
  return commonSchema.extend(shape)
}

/** Transforme un FormData en objet, en gardant les listes (cases à cocher multiples). */
export function formDataToObject(formData: FormData, service: ServiceDef): Record<string, unknown> {
  const multi = new Set(service.fields.filter((f) => f.type === 'checkboxes').map((f) => f.name))
  const result: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue
    if (multi.has(key)) {
      const list = (result[key] as string[] | undefined) ?? []
      list.push(String(value))
      result[key] = list
    } else {
      result[key] = value
    }
  }
  for (const name of multi) result[name] ??= []
  return result
}

/** Vérifie les fichiers joints : nombre, type et taille. */
export function validateFiles(
  files: File[],
  field: Extract<FieldDef, { type: 'files' }>,
  maxSize: number,
  maxTotal = Number.POSITIVE_INFINITY,
): RequestErrorKey | null {
  const real = files.filter((f) => f.size > 0)
  if (field.required && real.length === 0) return 'required'
  if (real.length > field.maxFiles) return 'files'
  const accepted = field.accept.split(',')
  if (real.some((f) => !accepted.includes(f.type))) return 'fileType'
  if (real.some((f) => f.size > maxSize)) return 'fileSize'
  if (real.reduce((sum, f) => sum + f.size, 0) > maxTotal) return 'totalSize'
  return null
}
