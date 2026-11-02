'use client'

import { MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

import { submitContact } from '@/app/(site)/[locale]/contact/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { SuccessMark } from '@/components/ui/success-mark'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { Link } from '@/i18n/navigation'
import type { ContactState } from '@/lib/schemas/contact'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const DRAFT_KEY = 'archi-design:brouillon-contact'
const DRAFT_FIELDS = ['name', 'phone', 'email', 'city', 'pole', 'preferredContact', 'subject', 'message'] as const

type Props = {
  poles: { key: string; label: string }[]
  whatsappNumber: string | null
  privacySlug: string | null
}

/**
 * Formulaire de contact.
 * - Validation côté serveur (les erreurs s'affichent sous chaque champ)
 * - Brouillon enregistré sur l'appareil : rien n'est perdu en cas de coupure réseau ou de courant
 * - Après envoi : bouton pour transmettre le même récapitulatif sur WhatsApp
 */
export function ContactForm({ poles, whatsappNumber, privacySlug }: Props) {
  const t = useTranslations('Contact')
  const form = useTranslations('Form')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: 'idle' })
  const [draftRestored, setDraftRestored] = useState(false)

  // Restaure le brouillon, puis le pôle passé dans l'adresse (?pole=peinture) s'il y en a un
  useEffect(() => {
    const node = formRef.current
    if (!node) return
    let restored = false
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Record<string, string> | null
      if (draft) {
        for (const name of DRAFT_FIELDS) {
          const field = node.elements.namedItem(name) as HTMLInputElement | null
          if (field && draft[name]) {
            field.value = draft[name]
            restored = true
          }
        }
      }
    } catch {
      // stockage indisponible : on continue sans brouillon
    }
    const pole = searchParams.get('pole')
    const poleField = node.elements.namedItem('pole') as HTMLSelectElement | null
    if (pole && poleField && poles.some((p) => p.key === pole)) poleField.value = pole
    if (restored) setDraftRestored(true)
  }, [searchParams, poles])

  // Efface le brouillon une fois le message bien reçu
  useEffect(() => {
    if (state.status !== 'success') return
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }, [state.status])

  const saveDraft = () => {
    const node = formRef.current
    if (!node) return
    const data = new FormData(node)
    const draft = Object.fromEntries(DRAFT_FIELDS.map((name) => [name, String(data.get(name) ?? '')]))
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {}
  }

  if (state.status === 'success') {
    const whatsapp = state.whatsappText ? buildWhatsAppLink(whatsappNumber, state.whatsappText) : null
    return (
      <div role="status" className="fade-up flex flex-col items-start gap-5 py-6">
        <SuccessMark />
        <p className="font-display text-3xl">{t('success')}</p>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary' })}>
            <MessageCircle aria-hidden />
            {t('successWhatsApp')}
          </a>
        )}
      </div>
    )
  }

  const errors = state.status === 'error' ? state.fieldErrors : {}
  const error = (field: keyof typeof errors) => (errors[field] ? t(`errors.${errors[field]}`) : undefined)
  const required = { required: true, requiredLabel: form('required') }

  return (
    <form ref={formRef} action={action} onInput={saveDraft} noValidate className="form-ui flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      {draftRestored && <p className="rounded-md bg-surface-sunken px-4 py-2 text-sm text-muted">{t('draftRestored')}</p>}

      {state.status === 'error' && (
        <p role="alert" className="rounded-md border border-danger/40 px-4 py-3 text-sm font-medium text-danger">
          {t(`errors.${state.reason}`)}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label={t('fields.name')} error={error('name')} {...required}>
          {(aria) => <Input {...aria} name="name" autoComplete="name" maxLength={120} />}
        </Field>
        <Field id="contact-phone" label={t('fields.phone')} hint={t('fields.phoneHint')} error={error('phone')} {...required}>
          {(aria) => <Input {...aria} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} />}
        </Field>
        <Field id="contact-email" label={t('fields.email')} error={error('email')}>
          {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" maxLength={200} />}
        </Field>
        <Field id="contact-city" label={t('fields.city')}>
          {(aria) => <Input {...aria} name="city" autoComplete="address-level2" maxLength={120} />}
        </Field>
        <Field id="contact-pole" label={t('fields.pole')}>
          {(aria) => (
            <Select {...aria} name="pole" defaultValue="">
              <option value="">{t('fields.polePlaceholder')}</option>
              {poles.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="contact-preferred" label={t('fields.preferredContact')}>
          {(aria) => (
            <Select {...aria} name="preferredContact" defaultValue="whatsapp">
              <option value="whatsapp">{t('contactOptions.whatsapp')}</option>
              <option value="appel">{t('contactOptions.appel')}</option>
              <option value="email">{t('contactOptions.email')}</option>
            </Select>
          )}
        </Field>
      </div>

      <Field id="contact-subject" label={t('fields.subject')} error={error('subject')} {...required}>
        {(aria) => <Input {...aria} name="subject" maxLength={200} />}
      </Field>
      <Field id="contact-message" label={t('fields.message')} error={error('message')} {...required}>
        {(aria) => <Textarea {...aria} name="message" rows={6} maxLength={5000} />}
      </Field>

      {/* Piège à robots : masqué aux humains et aux lecteurs d'écran */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {t('fields.website')}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={error('consent') ? true : undefined}
            aria-describedby={error('consent') ? 'contact-consent-error' : undefined}
            className="mt-0.5"
          />
          <span>
            {t('fields.consent')}{' '}
            {privacySlug && (
              <Link href={`/${privacySlug}`} className="text-accent underline">
                {t('fields.privacyLink')}
              </Link>
            )}
          </span>
        </label>
        {error('consent') && (
          <p id="contact-consent-error" className="text-sm font-medium text-danger">
            {error('consent')}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-start">
        {pending && <span className="spinner" aria-hidden />}
        {pending ? t('sending') : t('submit')}
      </Button>
    </form>
  )
}
