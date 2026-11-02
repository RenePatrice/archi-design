import { z } from 'zod'

import { poles } from '@/lib/navigation'

/**
 * Validation du formulaire de contact, appliquée côté serveur.
 * Chaque message d'erreur est une clé de traduction (section « Contact.errors »).
 */
export const contactSchema = z.object({
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
    .refine((v) => v === '' || z.email().safeParse(v).success, 'email'),
  city: z.string().trim().max(120).optional().default(''),
  pole: z.enum([...poles, '']).optional().default(''),
  preferredContact: z.enum(['whatsapp', 'appel', 'email']).default('whatsapp'),
  subject: z.string().trim().min(2, 'subject').max(200, 'subject'),
  message: z.string().trim().min(10, 'message').max(5000, 'message'),
  consent: z.literal('on', { error: 'consent' }),
})

export type ContactInput = z.infer<typeof contactSchema>

export type ContactErrorKey = 'name' | 'phone' | 'email' | 'subject' | 'message' | 'consent'

export type ContactState =
  | { status: 'idle' }
  | { status: 'success'; whatsappText: string }
  | {
      status: 'error'
      reason: 'invalid' | 'rateLimit' | 'server'
      fieldErrors: Partial<Record<keyof ContactInput, ContactErrorKey>>
    }
