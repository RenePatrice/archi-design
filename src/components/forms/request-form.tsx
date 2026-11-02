'use client'

import { CheckCircle2, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react'

import { submitRequest } from '@/app/(site)/[locale]/devis/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { Link } from '@/i18n/navigation'
import type { RequestState } from '@/lib/requests/process'
import { estimatePrint, formatGNF, type PrintSupportPricing } from '@/lib/requests/print-pricing'
import { CONTACT_MODES, MAX_FILE_SIZE, MAX_TOTAL_SIZE, PAYMENT_MODES, RECEPTION_MODES, SERVICES, UPLOAD_LIMITS, type FieldDef, type RequestService } from '@/lib/requests/services'
import { buildWhatsAppLink } from '@/lib/whatsapp'

type Props = {
  service: Exclude<RequestService, 'contact'>
  whatsappNumber: string | null
  privacySlug: string | null
  /** Sessions ouvertes (inscription formation) */
  sessions?: { id: number; label: string }[]
  defaultSessionId?: number
  /** Grille de prix (impression) pour le calcul en direct */
  printSupports?: PrintSupportPricing[]
  /** Contenu inséré avant les coordonnées (ex. récapitulatif du panier + champ caché) */
  children?: ReactNode
  /** Appelé après un envoi réussi (ex. vider le panier) */
  onSuccess?: () => void
  /** Désactive l'envoi (ex. panier vide) */
  disabled?: boolean
}

type Translator = (key: string, values?: Record<string, string | number>) => string

/**
 * Formulaire de demande générique : affiche les champs du service, les coordonnées communes,
 * gère le brouillon local, les erreurs serveur et l'écran de confirmation avec WhatsApp.
 */
export function RequestForm({ service, whatsappNumber, privacySlug, sessions, defaultSessionId, printSupports, children, onSuccess, disabled }: Props) {
  const t = useTranslations('Requests') as unknown as Translator
  const form = useTranslations('Form')
  const locale = useLocale()
  const def = SERVICES[service]
  const formRef = useRef<HTMLFormElement>(null)
  const draftKey = `archi-design:brouillon-${service}`
  const hiddenFields = new Set(def.fields.filter((f) => f.hidden).map((f) => f.name))
  const [state, action, pending] = useActionState<RequestState, FormData>(submitRequest, { status: 'idle' })
  const [draftRestored, setDraftRestored] = useState(false)
  const [printInput, setPrintInput] = useState({ support: '', width: '', height: '', quantity: '' })
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  // Vérifie la taille des fichiers AVANT l'envoi : une requête trop lourde serait refusée par l'hébergeur
  // avec une page d'erreur incompréhensible pour le visiteur
  const checkFileSizes = (event: React.FormEvent<HTMLFormElement>) => {
    const found: Record<string, string> = {}
    for (const input of event.currentTarget.querySelectorAll<HTMLInputElement>('input[type=file]')) {
      const list = Array.from(input.files ?? [])
      if (list.some((f) => f.size > MAX_FILE_SIZE)) found[input.name] = 'fileSize'
      else if (list.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_SIZE) found[input.name] = 'totalSize'
    }
    setLocalErrors(found)
    if (Object.keys(found).length) event.preventDefault()
  }

  const readPrintInput = () => {
    const node = formRef.current
    if (!node || service !== 'serigraphie') return
    const data = new FormData(node)
    setPrintInput({
      support: String(data.get('support') ?? ''),
      width: String(data.get('width') ?? ''),
      height: String(data.get('height') ?? ''),
      quantity: String(data.get('quantity') ?? ''),
    })
  }

  // Restaure le brouillon (sauf fichiers) au chargement
  useEffect(() => {
    const node = formRef.current
    if (!node) return
    try {
      const draft = JSON.parse(localStorage.getItem(draftKey) ?? 'null') as Record<string, string | string[]> | null
      if (!draft) return
      let restored = false
      for (const [name, value] of Object.entries(draft)) {
        if (hiddenFields.has(name)) continue
        const elements = node.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(name)}"]`)
        elements.forEach((el) => {
          if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = Array.isArray(value) ? value.includes(el.value) : value === el.value
          } else if (!(el instanceof HTMLInputElement && el.type === 'file') && typeof value === 'string' && value) {
            el.value = value
            restored = true
          }
        })
      }
      // Lecture unique du stockage local au montage : la mise à jour d'état est voulue ici
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (restored) setDraftRestored(true)
      readPrintInput()
    } catch {
      // stockage indisponible : on continue sans brouillon
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  useEffect(() => {
    if (state.status !== 'success') return
    try {
      localStorage.removeItem(draftKey)
    } catch {}
    onSuccess?.()
    formRef.current?.closest('section, main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [state.status, draftKey, onSuccess])

  const onInput = () => {
    readPrintInput()
    const node = formRef.current
    if (!node) return
    const draft: Record<string, string | string[]> = {}
    const data = new FormData(node)
    for (const key of new Set(data.keys())) {
      // Champs techniques et champs remplis par la page (simulateur) : jamais dans le brouillon
      if (['website', 'service', 'locale', 'cart', 'consent'].includes(key) || hiddenFields.has(key)) continue
      const values = data.getAll(key).filter((v): v is string => typeof v === 'string')
      if (values.length) draft[key] = values.length > 1 ? values : values[0]
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch {}
  }

  /* ───────── Écran de confirmation ───────── */
  if (state.status === 'success') {
    const whatsapp = state.whatsappText ? buildWhatsAppLink(whatsappNumber, state.whatsappText) : null
    return (
      <div role="status" className="flex flex-col items-start gap-5 rounded-md border border-success/40 bg-surface p-6 sm:p-8">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <h2 className="text-2xl font-bold">{t('confirmation.title')}</h2>
        {state.number && (
          <p className="flex flex-col gap-1">
            <span className="text-sm text-muted">{t('confirmation.number')}</span>
            <span className="font-mono text-2xl font-semibold tracking-wide text-accent" data-testid="numero-demande">
              {state.number}
            </span>
          </p>
        )}
        <p>{t('confirmation.text')}</p>
        {state.emailSent && <p className="text-sm text-muted">{t('confirmation.email')}</p>}
        {whatsapp && (
          <div className="flex flex-col gap-2">
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              <MessageCircle aria-hidden />
              {t('confirmation.whatsapp')}
            </a>
            <p className="text-sm text-muted">{t('confirmation.whatsappHint')}</p>
          </div>
        )}
      </div>
    )
  }

  /* ───────── Formulaire ───────── */
  const errors: Record<string, string> = { ...(state.status === 'error' ? state.fieldErrors : {}), ...localErrors }
  const errorFor = (name: string) =>
    errors[name] ? t(`errors.${errors[name]}`, { size: errors[name] === 'totalSize' ? UPLOAD_LIMITS.totalMB : UPLOAD_LIMITS.fileMB }) : undefined
  const required = { required: true, requiredLabel: form('required') }
  const id = (name: string) => `${service}-${name}`

  const renderField = (field: FieldDef) => {
    // Champ rempli par un composant de la page (ex. le simulateur) : rien à afficher ici
    if (field.hidden) return null
    const label = t(`fields.${field.name}`)
    const req = 'required' in field && field.required ? required : {}
    switch (field.type) {
      case 'text':
        return (
          <Field key={field.name} id={id(field.name)} label={label} error={errorFor(field.name)} {...req}>
            {(aria) => <Input {...aria} name={field.name} maxLength={field.max} />}
          </Field>
        )
      case 'textarea':
        return (
          <Field key={field.name} id={id(field.name)} label={label} error={errorFor(field.name)} className="sm:col-span-2" {...req}>
            {(aria) => <Textarea {...aria} name={field.name} maxLength={field.max} rows={4} />}
          </Field>
        )
      case 'number':
        return (
          <Field key={field.name} id={id(field.name)} label={label} error={errorFor(field.name)} {...req}>
            {(aria) => <Input {...aria} name={field.name} type="number" inputMode="decimal" min={field.min} max={field.max} step="any" />}
          </Field>
        )
      case 'date':
        return (
          <Field key={field.name} id={id(field.name)} label={label} error={errorFor(field.name)} {...req}>
            {(aria) => <Input {...aria} name={field.name} type="date" />}
          </Field>
        )
      case 'select':
        return (
          <Field key={field.name} id={id(field.name)} label={label} error={errorFor(field.name)} {...req}>
            {(aria) => (
              <Select {...aria} name={field.name} defaultValue="">
                <option value="">{t('common.choose')}</option>
                {field.options.map((o) => (
                  <option key={o} value={o}>
                    {t(`options.${field.name}.${o}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        )
      case 'checkboxes':
        return (
          <fieldset key={field.name} className="flex flex-col gap-2 sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold">{label}</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {field.options.map((o) => (
                <label key={o} className="flex min-h-11 items-center gap-2.5">
                  <input type="checkbox" name={field.name} value={o} className="size-5 accent-[var(--accent)]" />
                  {t(`options.${field.name}.${o}`)}
                </label>
              ))}
            </div>
          </fieldset>
        )
      case 'checkbox':
        return (
          <label key={field.name} className="flex min-h-11 items-center gap-2.5 sm:col-span-2">
            <input type="checkbox" name={field.name} className="size-5 shrink-0 accent-[var(--accent)]" />
            {label}
          </label>
        )
      case 'files':
        return (
          <Field
            key={field.name}
            id={id(field.name)}
            label={label}
            hint={service === 'serigraphie' ? t('printFileHint', { size: UPLOAD_LIMITS.fileMB }) : t('fileHint', { max: field.maxFiles, size: UPLOAD_LIMITS.fileMB })}
            error={errorFor(field.name)}
            className="sm:col-span-2"
            {...('required' in field && field.required ? required : {})}
          >
            {(aria) => (
              <input
                {...aria}
                name={field.name}
                type="file"
                multiple={field.maxFiles > 1}
                accept={field.accept}
                className="block w-full cursor-pointer rounded-md border border-dashed border-line bg-surface p-3 text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-sunken file:px-4 file:font-semibold file:text-ink"
              />
            )}
          </Field>
        )
    }
  }

  // Calcul en direct du prix d'impression
  const printSupport = printSupports?.find((s) => s.key === printInput.support)
  const estimate =
    service === 'serigraphie' && printInput.support && printInput.quantity
      ? estimatePrint(printSupport, {
          quantity: Number(printInput.quantity),
          widthCm: Number(printInput.width) || null,
          heightCm: Number(printInput.height) || null,
        })
      : null

  return (
    <form
      ref={formRef}
      action={action}
      onInput={onInput}
      onChange={onInput}
      onSubmit={checkFileSizes}
      noValidate
      className="flex flex-col gap-10"
    >
      <input type="hidden" name="service" value={service} />
      <input type="hidden" name="locale" value={locale} />

      {draftRestored && <p className="rounded-md bg-surface-sunken px-4 py-2 text-sm text-muted">{t('draftRestored')}</p>}
      {state.status === 'error' && (
        <p role="alert" className="rounded-md border border-danger/40 px-4 py-3 text-sm font-medium text-danger">
          {t(`errors.${state.reason}`)}
          {errors.cart && ` ${t('errors.cart')}`}
        </p>
      )}

      {children}

      {(def.fields.some((f) => !f.hidden) || sessions) && (
        <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 font-display text-xl font-bold [font-stretch:110%]">{t('sections.request')}</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {sessions && (
              <Field id={id('session')} label={t('fields.session')} error={errorFor('session')} className="sm:col-span-2" {...required}>
                {(aria) => (
                  <Select {...aria} name="session" defaultValue={defaultSessionId ? String(defaultSessionId) : ''}>
                    <option value="">{t('common.choose')}</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            {def.fields.map(renderField)}
          </div>

          {estimate && (
            <PrintEstimatePanel estimate={estimate} locale={locale} hasSetupFee={Boolean(printSupport?.setupFee)} />
          )}
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-5 font-display text-xl font-bold [font-stretch:110%]">{t('sections.customer')}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id('name')} label={t('common.name')} error={errorFor('name')} {...required}>
            {(aria) => <Input {...aria} name="name" autoComplete="name" maxLength={120} />}
          </Field>
          <Field id={id('phone')} label={t('common.phone')} hint={t('common.phoneHint')} error={errorFor('phone')} {...required}>
            {(aria) => <Input {...aria} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} />}
          </Field>
          <Field id={id('email')} label={t('common.email')} hint={t('common.emailHint')} error={errorFor('email')}>
            {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" maxLength={200} />}
          </Field>
          <Field id={id('city')} label={t('common.city')} error={errorFor('city')} {...required}>
            {(aria) => <Input {...aria} name="city" autoComplete="address-level2" maxLength={120} />}
          </Field>
          <Field id={id('address')} label={t('common.address')} className="sm:col-span-2">
            {(aria) => <Input {...aria} name="address" autoComplete="street-address" maxLength={300} />}
          </Field>
          <Field id={id('preferredContact')} label={t('common.preferredContact')}>
            {(aria) => (
              <Select {...aria} name="preferredContact" defaultValue="whatsapp">
                {CONTACT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {t(`options.preferredContact.${m}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-5 font-display text-xl font-bold [font-stretch:110%]">{t('sections.reception')}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {def.reception && (
            <Field id={id('receptionMode')} label={t('common.receptionMode')}>
              {(aria) => (
                <Select {...aria} name="receptionMode" defaultValue="">
                  <option value="">{t('common.choose')}</option>
                  {RECEPTION_MODES.map((m) => (
                    <option key={m} value={m}>
                      {t(`options.receptionMode.${m}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
          <Field id={id('paymentMode')} label={t('common.paymentMode')}>
            {(aria) => (
              <Select {...aria} name="paymentMode" defaultValue="">
                <option value="">{t('common.choose')}</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {t(`options.paymentMode.${m}`)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id={id('message')} label={t('common.message')} className="sm:col-span-2">
            {(aria) => <Textarea {...aria} name="message" rows={4} maxLength={3000} />}
          </Field>
        </div>
      </fieldset>

      {/* Piège à robots : masqué aux humains et aux lecteurs d'écran */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {t('common.website')}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={errorFor('consent') ? true : undefined}
            aria-describedby={errorFor('consent') ? id('consent-error') : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
          />
          <span>
            {t('common.consent')}{' '}
            {privacySlug && (
              <Link href={`/${privacySlug}`} className="text-accent underline">
                {t('common.privacyLink')}
              </Link>
            )}
          </span>
        </label>
        {errorFor('consent') && (
          <p id={id('consent-error')} className="text-sm font-medium text-danger">
            {errorFor('consent')}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending || disabled} className="self-start">
        {pending ? t('sending') : t('submit')}
      </Button>
    </form>
  )
}

/** Encadré du prix indicatif d'impression, mis à jour à chaque saisie. */
function PrintEstimatePanel({
  estimate,
  locale,
  hasSetupFee,
}: {
  estimate: ReturnType<typeof estimatePrint>
  locale: string
  hasSetupFee: boolean
}) {
  const t = useTranslations('Print')
  return (
    <div aria-live="polite" className="flex flex-col gap-1 rounded-md border-l-4 border-accent bg-surface-sunken p-4">
      <p className="eyebrow">{t('estimate')}</p>
      {estimate.ok ? (
        <>
          <p className="font-display text-3xl font-extrabold tabular-nums [font-stretch:115%]" data-testid="prix-indicatif">
            {formatGNF(estimate.total, locale)}
          </p>
          <p className="font-mono text-sm text-muted">
            {t('estimateDetail', { quantity: estimate.quantity, unit: formatGNF(estimate.unitPrice, locale) })}
            {estimate.areaM2 !== null && ` · ${t('area', { area: estimate.areaM2.toLocaleString(locale) })}`}
          </p>
          {estimate.discountPercent > 0 && <p className="text-sm text-success">{t('discount', { percent: estimate.discountPercent })}</p>}
          {hasSetupFee && <p className="text-sm text-muted">{t('setupFee')}</p>}
        </>
      ) : (
        <p className="text-sm text-muted">
          {estimate.reason === 'missingSize' && t('missingSize')}
          {estimate.reason === 'belowMinimum' && t('belowMinimum', { min: estimate.minQuantity ?? 1 })}
          {estimate.reason === 'unknownSupport' && t('unknownSupport')}
        </p>
      )}
      <p className="mt-1 text-xs text-muted">{t('disclaimer')}</p>
    </div>
  )
}
