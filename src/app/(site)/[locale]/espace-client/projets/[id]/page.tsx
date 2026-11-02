/* eslint-disable @next/next/no-img-element -- photos privées : servies avec la session du client, pas par l'optimiseur d'images */
import config from '@payload-config'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { MessageForm } from '@/components/client/client-forms'
import { ProgressBar } from '@/components/client/progress-bar'
import { Badge } from '@/components/ui/card'
import { mediaPath } from '@/components/ui/media-image'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCurrentUser } from '@/lib/client-auth'
import { localizedPath, pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { ClientFile, User } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: 'ClientArea' })
  return pageMetadata({ locale, path: `/espace-client/projets/${id}`, title: t('metaTitle'), noIndex: true })
}

const stageDot = { aVenir: 'border-line bg-surface', enCours: 'border-accent bg-accent', termine: 'border-deep bg-deep' } as const

/** Suivi détaillé d'un projet pour son client. */
export default async function ClientProjectPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const user = await getCurrentUser()
  if (!user) redirect(localizedPath(locale, '/espace-client'))

  const payload = await getPayload({ config })
  const projectId = Number(id)
  if (!Number.isInteger(projectId)) notFound()
  // Toutes les lectures se font avec les droits du client connecté
  const asClient = { user, overrideAccess: false } as const
  const { docs } = await payload.find({ collection: 'client-projects', where: { id: { equals: projectId } }, depth: 1, limit: 1, joins: false, ...asClient })
  const project = docs[0]
  if (!project) notFound() // projet inexistant ou appartenant à un autre client

  const [t, updates, files, messages] = await Promise.all([
    getTranslations('ClientArea'),
    payload.find({ collection: 'project-updates', where: { clientProject: { equals: projectId } }, sort: '-date', depth: 1, limit: 100, ...asClient }),
    payload.find({ collection: 'client-files', where: { clientProject: { equals: projectId } }, sort: '-createdAt', depth: 0, limit: 200, ...asClient }),
    payload.find({ collection: 'project-messages', where: { clientProject: { equals: projectId } }, sort: 'createdAt', depth: 1, limit: 200, ...asClient }),
  ])

  // Les réponses de l'équipe sont marquées lues à l'ouverture de la page
  const unread = messages.docs.filter((m) => m.fromStaff && !m.readByClient).map((m) => m.id)
  if (unread.length && !(user.role === 'admin' || user.role === 'equipe')) {
    await payload.update({ collection: 'project-messages', where: { id: { in: unread } }, data: { readByClient: true }, overrideAccess: true })
  }

  const date = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeZone: 'Africa/Conakry' })
  const dateTime = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Conakry' })
  const manager = typeof project.manager === 'object' ? (project.manager as User | null) : null
  const documents = files.docs.filter((f) => f.kind !== 'photo')
  const fileUrl = (f: ClientFile, size?: 'thumbnail' | 'large') => mediaPath((size && f.sizes?.[size]?.url) || f.url || '')

  const facts = [
    { label: t('location'), value: project.location },
    { label: t('started'), value: project.startDate ? date.format(new Date(project.startDate)) : null },
    { label: t('expected', { date: '' }).replace(/\s*:\s*$/, ''), value: project.expectedEndDate ? date.format(new Date(project.expectedEndDate)) : null },
    { label: t('manager'), value: manager ? [manager.name, manager.phone].filter(Boolean).join(' · ') : null },
  ].filter((f) => f.value)

  return (
    <div className="container-site flex flex-col gap-10 py-10 sm:py-14">
      <Link href="/espace-client" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accent">
        <ArrowLeft className="size-4" aria-hidden />
        {t('backToProjects')}
      </Link>

      {/* En-tête : statut, titre, avancement */}
      <header className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="flex flex-col gap-4">
          <Badge tone={project.status === 'livre' ? 'deep' : 'accent'} className="self-start">
            {t(`status.${project.status ?? 'enCours'}`)}
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight [font-stretch:115%] sm:text-5xl">{project.title}</h1>
          {project.summary && <p className="max-w-[60ch] text-lg text-muted">{project.summary}</p>}
        </div>
        <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5">
          <ProgressBar value={project.progress ?? 0} label={t('progress')} />
          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* Étapes : l'ordre est une information, d'où la liste ordonnée */}
      {project.stages && project.stages.length > 0 && (
        <section aria-labelledby="etapes" className="flex flex-col gap-5">
          <h2 id="etapes" className="text-2xl font-bold">
            {t('stages')}
          </h2>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.stages.map((stage, i) => (
              <li key={stage.id ?? i} className={cn('flex gap-3 rounded-md border border-line bg-surface p-4', stage.status === 'enCours' && 'border-accent', stage.status === 'aVenir' && 'text-muted')}>
                <span className={cn('mt-1 size-3.5 shrink-0 rounded-full border-2', stageDot[stage.status ?? 'aVenir'])} aria-hidden />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-semibold text-ink">{stage.title}</span>
                  <span className="text-xs">
                    {t(`stageStatus.${stage.status ?? 'aVenir'}`)}
                    {stage.date ? ` · ${date.format(new Date(stage.date))}` : ''}
                  </span>
                  {stage.note && <span className="text-sm text-muted">{stage.note}</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Journal du chantier */}
        <section aria-labelledby="actualites" className="flex flex-col gap-6">
          <h2 id="actualites" className="text-2xl font-bold">
            {t('updates')}
          </h2>
          {updates.docs.length === 0 && <p className="text-muted">{t('noUpdates')}</p>}
          <ol className="flex flex-col border-l-2 border-line">
            {updates.docs.map((update) => {
              const photos = (update.photos ?? []).filter((p): p is ClientFile => typeof p === 'object' && p !== null)
              return (
                <li key={update.id} className="relative flex flex-col gap-3 pb-10 pl-6 last:pb-0">
                  <span className="absolute top-1.5 -left-[7px] size-3 rounded-full bg-accent" aria-hidden />
                  <time dateTime={update.date} className="font-mono text-sm text-accent">
                    {date.format(new Date(update.date))}
                  </time>
                  <h3 className="text-lg font-bold">{update.title}</h3>
                  <p className="whitespace-pre-line text-muted">{update.text}</p>
                  {photos.length > 0 && (
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {photos.map((photo) => (
                        <li key={photo.id}>
                          <a href={fileUrl(photo, 'large')} target="_blank" rel="noopener" className="block overflow-hidden rounded-md bg-surface-sunken">
                            <img src={fileUrl(photo, 'thumbnail')} alt={photo.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform hover:scale-105" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <div className="flex flex-col gap-12">
          {/* Documents */}
          <section aria-labelledby="documents" className="flex flex-col gap-4">
            <h2 id="documents" className="text-2xl font-bold">
              {t('documents')}
            </h2>
            {documents.length === 0 ? (
              <p className="text-muted">{t('noDocuments')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <a href={fileUrl(doc)} download className="flex min-h-14 items-center gap-3 py-2 hover:text-accent">
                      <FileText className="size-5 shrink-0 text-accent" aria-hidden />
                      <span className="flex flex-1 flex-col">
                        <span className="font-semibold">{doc.title}</span>
                        <span className="font-mono text-xs text-muted">
                          {t(`kinds.${doc.kind ?? 'autre'}`)} · {date.format(new Date(doc.createdAt))}
                        </span>
                      </span>
                      <Download className="size-5 shrink-0" aria-label={t('download')} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Conversation avec l'équipe */}
          <section aria-labelledby="messages" className="flex flex-col gap-4">
            <h2 id="messages" className="text-2xl font-bold">
              {t('messages')}
            </h2>
            {messages.docs.length === 0 && <p className="text-muted">{t('noMessages')}</p>}
            <ol className="flex flex-col gap-3" aria-live="polite">
              {messages.docs.map((message) => {
                const author = typeof message.author === 'object' ? (message.author as User | null) : null
                return (
                  <li
                    key={message.id}
                    className={cn(
                      'flex max-w-[90%] flex-col gap-1 rounded-md p-3',
                      message.fromStaff ? 'self-start bg-surface-sunken' : 'self-end bg-deep text-deep-ink',
                    )}
                  >
                    <span className={cn('font-mono text-xs', message.fromStaff ? 'text-muted' : 'opacity-80')}>
                      {message.fromStaff ? `${t('team')}${author?.name ? ` · ${author.name}` : ''}` : t('you')} · {dateTime.format(new Date(message.createdAt))}
                    </span>
                    <p className="whitespace-pre-line">{message.body}</p>
                  </li>
                )
              })}
            </ol>
            <MessageForm projectId={project.id} />
          </section>
        </div>
      </div>
    </div>
  )
}
