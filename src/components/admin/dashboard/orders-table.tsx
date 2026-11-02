'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type OrderRow = {
  id: number | string
  number: string
  service: string
  status: string
  statusLabel: string
  customer: string
  phone: string
  createdAt: string
  total: number | null
}

type SortKey = 'number' | 'customer' | 'service' | 'status' | 'createdAt' | 'total'

const PAGE = 8

const TEXT = {
  fr: { search: 'Rechercher (n°, client, téléphone)…', all: 'Tous les statuts', number: 'N°', customer: 'Client', service: 'Service', status: 'Statut', date: 'Date', total: 'Estimation', empty: 'Aucune demande.', of: 'sur', prev: 'Précédent', next: 'Suivant' },
  en: { search: 'Search (no., customer, phone)…', all: 'All statuses', number: 'No.', customer: 'Customer', service: 'Service', status: 'Status', date: 'Date', total: 'Estimate', empty: 'No request.', of: 'of', prev: 'Previous', next: 'Next' },
}

/** Tableau des dernières demandes : recherche instantanée, filtre par statut, tri par colonne, pagination. */
export function OrdersTable({ rows, lang, statuses }: { rows: OrderRow[]; lang: 'fr' | 'en'; statuses: { value: string; label: string }[] }) {
  const t = TEXT[lang]
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'createdAt', dir: -1 })
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => !status || r.status === status)
      .filter((r) => !q || `${r.number} ${r.customer} ${r.phone}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const va = a[sort.key] ?? ''
        const vb = b[sort.key] ?? ''
        return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir
      })
  }, [rows, query, status, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE)
  const df = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const nf = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 0 })

  const th = (key: SortKey, label: string, align?: 'end') => (
    <th aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={align === 'end' ? 'ad-num' : undefined}>
      <button
        type="button"
        onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))}
      >
        {label}
        <span aria-hidden className="ad-sort">{sort.key === key ? (sort.dir === 1 ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  )

  return (
    <div className="ad-table-wrap">
      <div className="ad-table-tools">
        <input
          type="search"
          value={query}
          placeholder={t.search}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          aria-label={t.search}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(0)
          }}
          aria-label={t.status}
        >
          <option value="">{t.all}</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="ad-table-scroll">
        <table className="ad-table">
          <thead>
            <tr>
              {th('number', t.number)}
              {th('customer', t.customer)}
              {th('service', t.service)}
              {th('status', t.status)}
              {th('createdAt', t.date)}
              {th('total', t.total, 'end')}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="ad-empty">
                  {t.empty}
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/collections/orders/${r.id}`} className="ad-mono">
                      {r.number}
                    </Link>
                  </td>
                  <td>
                    <span className="ad-cell-main">{r.customer}</span>
                    <span className="ad-cell-sub">{r.phone}</span>
                  </td>
                  <td>{r.service}</td>
                  <td>
                    <span className={`ad-pill ad-pill--${r.status}`}>{r.statusLabel}</span>
                  </td>
                  <td className="ad-nowrap">{df.format(new Date(r.createdAt))}</td>
                  <td className="ad-num">{r.total ? `${nf.format(r.total)} GNF` : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="ad-table-foot">
        <span>
          {filtered.length ? `${current * PAGE + 1}–${Math.min(filtered.length, (current + 1) * PAGE)} ${t.of} ${filtered.length}` : ''}
        </span>
        <span className="ad-pager">
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)}>
            ← {t.prev}
          </button>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
            {t.next} →
          </button>
        </span>
      </div>
    </div>
  )
}
