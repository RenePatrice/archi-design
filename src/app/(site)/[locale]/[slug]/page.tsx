import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { RichText } from '@/components/ui/rich-text'
import { routing, type Locale } from '@/i18n/routing'
import { getPageBySlug } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

type Props = { params: Promise<{ locale: Locale; slug: string }> }

/** Pages de texte du back-office (mentions légales, confidentialité, CGV…), à la racine du site. */
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true } })
  return routing.locales.flatMap((locale) => docs.map((d) => ({ locale, slug: d.slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getPageBySlug(locale, slug)
  if (!page) return {}
  return pageMetadata({ locale, path: `/${slug}`, title: page.title })
}

export default async function TextPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const page = await getPageBySlug(locale, slug)
  if (!page) notFound()

  return (
    <article className="container-site flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumbs locale={locale} items={[{ label: page.title }]} />
      <h1 className="text-4xl font-extrabold">{page.title}</h1>
      <RichText data={page.content} />
      <p className="font-mono text-xs text-muted">
        {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(page.updatedAt))}
      </p>
    </article>
  )
}
