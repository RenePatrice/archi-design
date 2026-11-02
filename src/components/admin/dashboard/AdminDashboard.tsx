import type { ServerProps } from 'payload'
import Link from 'next/link'

import { ORDER_STATUSES, REQUEST_SERVICES } from '@/lib/requests/services'

import { MonthlyChart, ServicesChart, StatusChart } from './charts'
import { OrdersTable, type OrderRow } from './orders-table'

/**
 * Tableau de bord du back-office (affiché au-dessus des cartes de collections de Payload).
 * Tout est calculé côté serveur à chaque visite : indicateurs, graphiques, dernières demandes.
 * Les clients n'ont pas accès au back-office ; on ne montre rien à un autre rôle que l'équipe.
 */

const SERVICE_LABELS: Record<string, { fr: string; en: string }> = {
  architecture: { fr: 'Architecture', en: 'Architecture' },
  peinture: { fr: 'Peinture', en: 'Painting' },
  calligraphie: { fr: 'Calligraphie', en: 'Calligraphy' },
  serigraphie: { fr: 'Impression', en: 'Printing' },
  dessin: { fr: 'Dessin d’art', en: 'Drawing' },
  formation: { fr: 'Formation', en: 'Training' },
  boutique: { fr: 'Boutique', en: 'Shop' },
  prestation: { fr: 'Prestation', en: 'Consulting' },
  simulateur: { fr: 'Simulateur', en: 'Simulator' },
  contact: { fr: 'Contact', en: 'Contact' },
}

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  nouvelle: { fr: 'Nouvelle', en: 'New' },
  contactee: { fr: 'Contactée', en: 'Contacted' },
  confirmee: { fr: 'Confirmée', en: 'Confirmed' },
  livree: { fr: 'Livrée', en: 'Delivered' },
  annulee: { fr: 'Annulée', en: 'Cancelled' },
}

const TEXT = {
  fr: {
    hello: 'Bonjour',
    intro: 'Voici l’activité d’ARCHI-DESIGN en un coup d’œil.',
    month: 'Demandes ce mois-ci',
    vsLast: 'vs mois dernier',
    toHandle: 'Demandes à traiter',
    toHandleHint: 'statut « Nouvelle »',
    contacts: 'Messages de contact',
    contactsHint: 'non traités',
    clientMsgs: 'Messages clients',
    clientMsgsHint: 'non lus par l’équipe',
    projects: 'Chantiers en cours',
    projectsHint: 'projets clients actifs',
    pipeline: 'Montant estimé en cours',
    pipelineHint: 'demandes non livrées ni annulées',
    monthly: 'Demandes reçues · 12 derniers mois',
    services: 'Répartition par service',
    status: 'Suivi des demandes',
    latest: 'Dernières demandes',
    seeAll: 'Tout voir',
    activeProjects: 'Chantiers clients',
    sessions: 'Prochaines formations',
    noProjects: 'Aucun chantier en cours.',
    noSessions: 'Aucune session programmée.',
    seats: 'places',
    quick: 'Actions rapides',
    newProject: 'Nouvelle réalisation',
    newProduct: 'Nouveau produit',
    newSession: 'Nouvelle session',
    settings: 'Réglages du site',
    viewSite: 'Voir le site',
    other: 'Autres',
    content: 'Contenus',
    unit: 'demandes',
  },
  en: {
    hello: 'Hello',
    intro: 'Here is ARCHI-DESIGN’s activity at a glance.',
    month: 'Requests this month',
    vsLast: 'vs last month',
    toHandle: 'Requests to handle',
    toHandleHint: 'status “New”',
    contacts: 'Contact messages',
    contactsHint: 'not handled',
    clientMsgs: 'Client messages',
    clientMsgsHint: 'unread by the team',
    projects: 'Active sites',
    projectsHint: 'client projects in progress',
    pipeline: 'Estimated open amount',
    pipelineHint: 'requests not delivered or cancelled',
    monthly: 'Requests received · last 12 months',
    services: 'By service',
    status: 'Request pipeline',
    latest: 'Latest requests',
    seeAll: 'See all',
    activeProjects: 'Client projects',
    sessions: 'Upcoming trainings',
    noProjects: 'No active project.',
    noSessions: 'No scheduled session.',
    seats: 'seats',
    quick: 'Quick actions',
    newProject: 'New project',
    newProduct: 'New product',
    newSession: 'New session',
    settings: 'Site settings',
    viewSite: 'View site',
    other: 'Other',
    content: 'Content',
    unit: 'requests',
  },
}

type Lang = keyof typeof TEXT

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export async function AdminDashboard({ payload, user, i18n }: ServerProps) {
  const role = (user as { role?: string } | undefined)?.role
  if (role !== 'admin' && role !== 'equipe') return null

  const lang: Lang = i18n?.language === 'en' ? 'en' : 'fr'
  const t = TEXT[lang]
  const nf = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 0 })

  const now = new Date()
  const since = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const [orders, latest, contacts, clientMsgs, projects, sessions] = await Promise.all([
    payload.find({
      collection: 'orders',
      where: { createdAt: { greater_than_equal: since.toISOString() } },
      select: { service: true, status: true, createdAt: true, estimatedTotal: true },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'orders',
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      select: { number: true, service: true, status: true, customerName: true, customerPhone: true, createdAt: true, estimatedTotal: true },
      overrideAccess: true,
    }),
    payload.count({ collection: 'contact-messages', where: { status: { equals: 'nouveau' } }, overrideAccess: true }),
    payload.count({
      collection: 'project-messages',
      where: { and: [{ fromStaff: { not_equals: true } }, { readByStaff: { not_equals: true } }] },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'client-projects',
      where: { status: { in: ['etude', 'enCours'] } },
      sort: '-updatedAt',
      limit: 6,
      depth: 0,
      select: { title: true, progress: true, status: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'training-sessions',
      where: { startDate: { greater_than_equal: now.toISOString() } },
      sort: 'startDate',
      limit: 4,
      depth: 1,
      overrideAccess: true,
    }),
  ])

  // Agrégats sur 12 mois glissants
  const months: { key: string; label: string; count: number }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1)
    months.push({
      key: monthKey(d),
      label: d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short' }).replace('.', ''),
      count: 0,
    })
  }
  const byService: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  let openAmount = 0
  for (const o of orders.docs) {
    const m = months.find((x) => x.key === monthKey(new Date(o.createdAt)))
    if (m) m.count++
    if (o.service) byService[o.service] = (byService[o.service] ?? 0) + 1
    if (o.status) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1
    if (o.status !== 'livree' && o.status !== 'annulee') openAmount += Number(o.estimatedTotal ?? 0)
  }

  const thisMonth = months[11].count
  const lastMonth = months[10].count
  const delta = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null

  // Camembert : 5 services principaux + « Autres » (jamais plus de 6 couleurs)
  const ranked = REQUEST_SERVICES.map((s) => ({ name: SERVICE_LABELS[s][lang], value: byService[s] ?? 0 }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
  const services = ranked.length > 6
    ? [...ranked.slice(0, 5), { name: t.other, value: ranked.slice(5).reduce((n, s) => n + s.value, 0) }]
    : ranked

  const statuses = ORDER_STATUSES.map((s) => ({ name: STATUS_LABELS[s][lang], value: byStatus[s] ?? 0 }))

  const rows: OrderRow[] = latest.docs.map((o) => ({
    id: o.id,
    number: o.number,
    service: SERVICE_LABELS[o.service]?.[lang] ?? o.service,
    status: o.status,
    statusLabel: STATUS_LABELS[o.status]?.[lang] ?? o.status,
    customer: o.customerName ?? '',
    phone: o.customerPhone ?? '',
    createdAt: o.createdAt,
    total: o.estimatedTotal ?? null,
  }))

  const firstName = (user as { name?: string; email?: string }).name?.split(' ')[0] ?? ''

  const kpis = [
    {
      label: t.month,
      value: nf.format(thisMonth),
      hint: delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta} % ${t.vsLast}`,
      trend: delta === null ? undefined : delta >= 0 ? 'up' : 'down',
      href: '/admin/collections/orders',
      icon: 'inbox',
    },
    { label: t.toHandle, value: nf.format(byStatus.nouvelle ?? 0), hint: t.toHandleHint, href: '/admin/collections/orders?where[status][equals]=nouvelle', icon: 'bell', alert: (byStatus.nouvelle ?? 0) > 0 },
    { label: t.contacts, value: nf.format(contacts.totalDocs), hint: t.contactsHint, href: '/admin/collections/contact-messages?where[status][equals]=nouveau', icon: 'mail', alert: contacts.totalDocs > 0 },
    { label: t.clientMsgs, value: nf.format(clientMsgs.totalDocs), hint: t.clientMsgsHint, href: '/admin/collections/project-messages', icon: 'chat', alert: clientMsgs.totalDocs > 0 },
    { label: t.projects, value: nf.format(projects.totalDocs), hint: t.projectsHint, href: '/admin/collections/client-projects', icon: 'site' },
    { label: t.pipeline, value: `${new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(openAmount)} GNF`, hint: t.pipelineHint, href: '/admin/collections/orders', icon: 'chart' },
  ] as const

  return (
    <div className="ad-dash">
      <header className="ad-hero">
        <div>
          <p className="ad-eyebrow">ARCHI-DESIGN · {now.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="ad-hero__title">
            {t.hello}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="ad-hero__intro">{t.intro}</p>
        </div>
        <nav className="ad-quick" aria-label={t.quick}>
          <Link href="/admin/collections/projects/create" className="ad-btn ad-btn--primary">+ {t.newProject}</Link>
          <Link href="/admin/collections/products/create" className="ad-btn">+ {t.newProduct}</Link>
          <Link href="/admin/collections/training-sessions/create" className="ad-btn">+ {t.newSession}</Link>
          <Link href="/admin/globals/site-settings" className="ad-btn ad-btn--ghost">{t.settings}</Link>
          <a href="/" target="_blank" rel="noreferrer" className="ad-btn ad-btn--ghost">{t.viewSite} ↗</a>
        </nav>
      </header>

      <section className="ad-kpis">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className={`ad-kpi${'alert' in k && k.alert ? ' ad-kpi--alert' : ''}`}>
            <span className="ad-kpi__icon" aria-hidden>
              <KpiIcon name={k.icon} />
            </span>
            <span className="ad-kpi__label">{k.label}</span>
            <span className="ad-kpi__value">{k.value}</span>
            <span className={`ad-kpi__hint${'trend' in k && k.trend ? ` ad-kpi__hint--${k.trend}` : ''}`}>{k.hint}</span>
          </Link>
        ))}
      </section>

      <section className="ad-grid">
        <article className="ad-card ad-card--wide">
          <h2 className="ad-card__title">{t.monthly}</h2>
          <MonthlyChart labels={months.map((m) => m.label)} values={months.map((m) => m.count)} seriesName={t.month} />
        </article>
        <article className="ad-card">
          <h2 className="ad-card__title">{t.services}</h2>
          <ServicesChart data={services} unit={t.unit} />
        </article>
      </section>

      <section className="ad-grid">
        <article className="ad-card ad-card--wide">
          <div className="ad-card__head">
            <h2 className="ad-card__title">{t.latest}</h2>
            <Link href="/admin/collections/orders" className="ad-link">{t.seeAll} →</Link>
          </div>
          <OrdersTable rows={rows} lang={lang} statuses={ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s][lang] }))} />
        </article>
        <div className="ad-stack">
          <article className="ad-card">
            <h2 className="ad-card__title">{t.status}</h2>
            <StatusChart data={statuses} />
          </article>
          <article className="ad-card">
            <div className="ad-card__head">
              <h2 className="ad-card__title">{t.activeProjects}</h2>
              <Link href="/admin/collections/client-projects" className="ad-link">{t.seeAll} →</Link>
            </div>
            {projects.docs.length === 0 ? (
              <p className="ad-empty">{t.noProjects}</p>
            ) : (
              <ul className="ad-progress-list">
                {projects.docs.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/collections/client-projects/${p.id}`}>
                      <span className="ad-progress-list__row">
                        <span>{p.title}</span>
                        <strong>{p.progress ?? 0} %</strong>
                      </span>
                      <span className="ad-bar" role="progressbar" aria-valuenow={p.progress ?? 0} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${p.progress ?? 0}%` }} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="ad-card">
            <h2 className="ad-card__title">{t.sessions}</h2>
            {sessions.docs.length === 0 ? (
              <p className="ad-empty">{t.noSessions}</p>
            ) : (
              <ul className="ad-sessions">
                {sessions.docs.map((s) => {
                  const d = new Date(s.startDate)
                  const training = typeof s.training === 'object' && s.training ? s.training.title : ''
                  return (
                    <li key={s.id}>
                      <Link href={`/admin/collections/training-sessions/${s.id}`}>
                        <span className="ad-date">
                          <strong>{d.getDate()}</strong>
                          <span>{d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short' })}</span>
                        </span>
                        <span>
                          <span className="ad-sessions__title">{training || s.label}</span>
                          <span className="ad-sessions__meta">
                            {s.location} · {s.seats} {t.seats}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </article>
        </div>
      </section>

    </div>
  )
}

function KpiIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    inbox: 'M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v6H4z',
    bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20h4',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    chat: 'M4 5h16v11H9l-5 4z',
    site: 'M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6',
    chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}
