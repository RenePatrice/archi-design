import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import { Badge, Card } from '@/components/ui/card'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import type { Locale } from '@/i18n/routing'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

/** Nuancier de la charte : nom, code et rôle de chaque couleur. */
const swatches = [
  { name: 'Latérite', hex: '#A0521E', role: 'Actions, boutons « Demander un devis »', className: 'bg-laterite text-white' },
  { name: 'Vert Fouta', hex: '#1F4A3A', role: 'En-tête, pied de page, institutionnel', className: 'bg-fouta text-kaolin' },
  { name: 'Indigo leppi', hex: '#24305E', role: 'Pôles créatifs', className: 'bg-leppi text-kaolin' },
  { name: 'Charbon de forge', hex: '#1C1E1D', role: 'Texte, fond sombre', className: 'bg-forge text-kaolin' },
  { name: 'Kaolin', hex: '#F2F1EC', role: 'Fond des pages', className: 'bg-kaolin text-forge border border-line' },
  { name: 'Sable', hex: '#E0A46A', role: 'Action en mode sombre', className: 'bg-sable text-forge' },
]

/**
 * Page interne qui montre la charte et les composants dans les deux thèmes.
 * Sert de référence pour les phases suivantes ; exclue des moteurs de recherche.
 */
export default async function DesignSystemPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('DesignSystem')
  const form = await getTranslations('Form')
  const common = await getTranslations('Common')

  return (
    <div className="container-site flex flex-col gap-16 py-12">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Latérite &amp; Leppi</p>
        <h1 className="text-4xl font-extrabold">{t('title')}</h1>
        <p className="max-w-[60ch] text-muted">{t('intro')}</p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Couleurs</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {swatches.map((s) => (
            <li key={s.hex} className="flex flex-col overflow-hidden rounded-md border border-line bg-surface">
              <div className={`flex h-24 items-end p-3 font-mono text-sm ${s.className}`}>{s.hex}</div>
              <div className="flex flex-col gap-0.5 p-3">
                <span className="font-semibold">{s.name}</span>
                <span className="text-sm text-muted">{s.role}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="frise-leppi" aria-hidden />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Typographies</h2>
        <div className="flex flex-col gap-4">
          <p className="text-5xl font-extrabold [font-stretch:118%]">Archivo élargi</p>
          <p className="max-w-[65ch] text-lg">
            Manrope pour le texte courant : une villa R+1 de 240 m² à Kipé, enduits à la chaux, brise-soleil en
            bois local et ventilation traversante.
          </p>
          <p className="font-mono text-sm text-muted">IBM Plex Mono · Commande AD-2026-0001 · Surface 240 m² · Délai 9 mois</p>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Boutons et étiquettes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{common('requestQuote')}</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Conakry</Badge>
          <Badge tone="accent">Architecture</Badge>
          <Badge tone="deep">Livré</Badge>
          <Badge tone="creative">Calligraphie</Badge>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Formulaire</h2>
        <Card className="grid max-w-2xl gap-5">
          <Field id="ds-nom" label="Nom complet" required requiredLabel={form('required')}>
            {(aria) => <Input {...aria} autoComplete="name" defaultValue="Mariama Diallo" />}
          </Field>
          <Field id="ds-tel" label="Téléphone / WhatsApp" hint="Format international, ex. +224 620 00 00 00">
            {(aria) => <Input {...aria} type="tel" inputMode="tel" autoComplete="tel" />}
          </Field>
          <Field id="ds-type" label="Type de projet">
            {(aria) => (
              <Select {...aria} defaultValue="villa">
                <option value="villa">Villa</option>
                <option value="immeuble">Immeuble</option>
                <option value="commerce">Commerce</option>
                <option value="renovation">Rénovation</option>
              </Select>
            )}
          </Field>
          <Field id="ds-surface" label="Surface (m²)" error="Indiquez une surface entre 10 et 10 000 m².">
            {(aria) => <Input {...aria} inputMode="numeric" defaultValue="5" />}
          </Field>
          <Field id="ds-message" label="Message">
            {(aria) => <Textarea {...aria} />}
          </Field>
        </Card>
      </section>
    </div>
  )
}
