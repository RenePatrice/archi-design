'use client'

import { useSearchParams } from 'next/navigation'

import { RequestForm } from './request-form'

/** Formulaire d'inscription : présélectionne la session passée dans l'adresse (?session=12). */
export function EnrollmentForm(props: { sessions: { id: number; label: string }[]; whatsappNumber: string | null; privacySlug: string | null }) {
  const searchParams = useSearchParams()
  const requested = Number(searchParams.get('session'))
  const defaultSessionId = props.sessions.some((s) => s.id === requested) ? requested : props.sessions[0]?.id

  return <RequestForm service="formation" defaultSessionId={defaultSessionId} {...props} />
}
