import config from '@payload-config'
import { ArrowRight, LogOut } from 'lucide-react'
import type { Metadata } from 'next'
import NextLink from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { LoginForm } from '@/components/client/client-forms'
import { ProgressBar } from '@/components/client/progress-bar'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCurrentUser } from '@/lib/client-auth'
import { pageMetadata } from '@/lib/seo'

import { logout } from './actions'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ClientArea' })
  return pageMetadata({ locale, path: '/espace-client', title: t('metaTitle'), noIndex: true })
}

/** Accueil de l'espace client : connexion, ou liste des projets suivis du client connecté. */
export default async function ClientAreaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const [t, user] = await Promise.all([getTranslations('ClientArea'), getCurrentUser()])
  const dateFmt = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'Africa/Conakry' })

  if (!user) {
    return (
      <div className="container-site grid gap-12 py-10 sm:py-14 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div className="flex flex-col gap-5">
          <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1 className="text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{t('loginTitle')}</h1>
          <p className="max-w-[56ch] text-lg text-muted">{t('loginIntro')}</p>
        </div>
        <div className="flex flex-col gap-5 rounded-md border border-line bg-surface p-6 sm:p-8">
          <LoginForm />
          <p className="border-t border-line pt-5 text-sm text-muted">
            {t('noAccount')}{' '}
            <Link href="/contact" className="font-semibold text-accent underline underline-offset-4">
              {t('contactUs')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Projets du client, lus avec SES droits : Payload ne renvoie que les siens
  const payload = await getPayload({ config })
  const { docs: projects } = await payload.find({
    collection: 'client-projects',
    user,
    overrideAccess: false,
    depth: 0,
    limit: 50,
    sort: '-updatedAt',
    joins: false,
  })
  const isStaff = user.role === 'admin' || user.role === 'equipe'

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <div className="flex flex-col gap-5">
        <Breadcrumbs locale={locale} items={[{ label: t('metaTitle') }]} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">{t('eyebrow')}</p>
            <h1 className="text-4xl font-extrabold tracking-tight [font-stretch:115%]">{t('hello', { name: user.name })}</h1>
          </div>
          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="ghost">
              <LogOut aria-hidden />
              {t('logout')}
            </Button>
          </form>
        </div>
      </div>

      {isStaff && (
        <p className="flex flex-wrap items-center gap-3 rounded-md bg-surface-sunken p-4 text-sm">
          {t('staffNote')}
          {/* Lien hors de la zone multilingue : NextLink et non le Link de next-intl */}
          <NextLink href="/admin" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            {t('openAdmin')}
          </NextLink>
        </p>
      )}

      <section aria-labelledby="mes-projets" className="flex flex-col gap-5">
        <h2 id="mes-projets" className="text-2xl font-bold">
          {t('projects')}
        </h2>
        {projects.length === 0 ? (
          <p className="rounded-md border border-dashed border-line p-8 text-muted">{t('noProjects')}</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id} className="group relative flex flex-col gap-4 rounded-md border border-line bg-surface p-6 transition-colors hover:border-accent">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={project.status === 'livre' ? 'deep' : 'accent'}>{t(`status.${project.status ?? 'enCours'}`)}</Badge>
                  {project.location && <Badge>{project.location}</Badge>}
                </div>
                <h3 className="text-xl font-bold">
                  <Link href={`/espace-client/projets/${project.id}`} className="after:absolute after:inset-0">
                    {project.title}
                  </Link>
                </h3>
                <ProgressBar value={project.progress ?? 0} label={t('progress')} />
                <p className="font-mono text-xs text-muted">
                  {project.expectedEndDate ? t('expected', { date: dateFmt.format(new Date(project.expectedEndDate)) }) : null}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  {t('open')}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
