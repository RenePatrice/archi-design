import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ForgotPasswordForm, ResetPasswordForm } from '@/components/client/client-forms'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ token?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ClientArea' })
  return pageMetadata({ locale, path: '/espace-client/mot-de-passe', title: t('forgotTitle'), noIndex: true })
}

/** Mot de passe oublié (sans jeton) ou choix du nouveau mot de passe (avec le jeton reçu par e-mail). */
export default async function PasswordPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { token } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('ClientArea')

  return (
    <div className="container-site flex max-w-xl flex-col gap-6 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: t('metaTitle'), href: '/espace-client' }, { label: token ? t('resetTitle') : t('forgotTitle') }]} />
      <h1 className="text-3xl font-extrabold">{token ? t('resetTitle') : t('forgotTitle')}</h1>
      {!token && <p className="text-muted">{t('forgotIntro')}</p>}
      {token ? <ResetPasswordForm token={token} /> : <ForgotPasswordForm />}
      <Link href="/espace-client" className="text-sm font-semibold text-accent underline underline-offset-4">
        {t('backToLogin')}
      </Link>
    </div>
  )
}
