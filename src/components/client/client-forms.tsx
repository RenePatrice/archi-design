'use client'

import { CheckCircle2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'

import {
  login,
  requestPasswordReset,
  resetPassword,
  sendClientMessage,
  type ClientActionState,
} from '@/app/(site)/[locale]/espace-client/actions'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { Link } from '@/i18n/navigation'

const idle: ClientActionState = { status: 'idle' }

function ErrorAlert({ state }: { state: ClientActionState }) {
  const t = useTranslations('ClientArea')
  if (state.status !== 'error') return null
  return (
    <p role="alert" className="rounded-md border border-danger/40 px-4 py-3 text-sm font-medium text-danger">
      {t(`errors.${state.error as 'server'}`)}
    </p>
  )
}

/** Connexion : e-mail + mot de passe. */
export function LoginForm() {
  const t = useTranslations('ClientArea')
  const locale = useLocale()
  const [state, action, pending] = useActionState(login, idle)
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <ErrorAlert state={state} />
      <Field id="client-email" label={t('email')}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="username" required />}
      </Field>
      <Field id="client-password" label={t('password')}>
        {(aria) => <Input {...aria} name="password" type="password" autoComplete="current-password" required />}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t('loggingIn') : t('login')}
        </Button>
        <Link href="/espace-client/mot-de-passe" className="text-sm font-semibold text-accent underline underline-offset-4">
          {t('forgot')}
        </Link>
      </div>
    </form>
  )
}

/** Demande de lien de réinitialisation. */
export function ForgotPasswordForm() {
  const t = useTranslations('ClientArea')
  const [state, action, pending] = useActionState(requestPasswordReset, idle)
  if (state.status === 'success')
    return (
      <p role="status" className="flex items-start gap-3 rounded-md border border-success/40 bg-surface p-5">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        {t('linkSent')}
      </p>
    )
  return (
    <form action={action} className="flex flex-col gap-5">
      <ErrorAlert state={state} />
      <Field id="forgot-email" label={t('email')}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" required />}
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {t('sendLink')}
      </Button>
    </form>
  )
}

/** Choix du nouveau mot de passe (lien reçu par e-mail). */
export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('ClientArea')
  const locale = useLocale()
  const [state, action, pending] = useActionState(resetPassword, idle)
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <ErrorAlert state={state} />
      <Field id="reset-password" label={t('newPassword')} hint={t('newPasswordHint')}>
        {(aria) => <Input {...aria} name="password" type="password" autoComplete="new-password" minLength={8} required />}
      </Field>
      <Field id="reset-confirm" label={t('confirmPassword')}>
        {(aria) => <Input {...aria} name="confirm" type="password" autoComplete="new-password" minLength={8} required />}
      </Field>
      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {t('save')}
      </Button>
    </form>
  )
}

/** Nouveau message à l'équipe ; la conversation se rafraîchit après l'envoi. */
export function MessageForm({ projectId }: { projectId: number }) {
  const t = useTranslations('ClientArea')
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(sendClientMessage, idle)

  useEffect(() => {
    if (state.status !== 'success') return
    formRef.current?.reset()
    router.refresh()
  }, [state, router])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId} />
      <ErrorAlert state={state} />
      {state.status === 'success' && (
        <p role="status" className="text-sm text-success">
          {t('sent')}
        </p>
      )}
      <Field id="client-message" label={t('messageLabel')}>
        {(aria) => <Textarea {...aria} name="body" rows={4} minLength={2} maxLength={4000} required />}
      </Field>
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? t('sending') : t('send')}
      </Button>
    </form>
  )
}
