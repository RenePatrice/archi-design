import 'server-only'

import { Document, Page, renderToBuffer, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { SimulatorResult } from './estimate'

/*
 * PDF de pré-devis « aux couleurs de l'entreprise », généré côté serveur.
 * Polices standard du PDF (Helvetica) : aucun téléchargement, accents français pris en charge.
 */

const c = { laterite: '#A0521E', fouta: '#1F4A3A', leppi: '#24305E', forge: '#1C1E1D', kaolin: '#F2F1EC', sable: '#E0A46A', muted: '#4E5752', line: '#D6D6CE' }

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: c.forge, paddingBottom: 60 },
  band: { backgroundColor: c.fouta, paddingVertical: 18, paddingHorizontal: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mono: { backgroundColor: c.laterite, color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 14, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  brand: { color: c.kaolin, fontFamily: 'Helvetica-Bold', fontSize: 15, letterSpacing: 0.5 },
  brandSub: { color: c.sable, fontSize: 7, letterSpacing: 3, marginTop: 2 },
  bandRight: { color: c.kaolin, fontSize: 8, textAlign: 'right' },
  frise: { height: 5, backgroundColor: c.laterite, borderBottomWidth: 3, borderBottomColor: c.leppi },
  body: { paddingHorizontal: 36, paddingTop: 24 },
  eyebrow: { fontSize: 8, letterSpacing: 2, color: c.laterite, marginBottom: 4 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 22, marginBottom: 4 },
  subtitle: { fontSize: 10, color: c.muted, marginBottom: 18 },
  totals: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  totalBox: { flex: 1, backgroundColor: c.kaolin, padding: 12, borderLeftWidth: 4, borderLeftColor: c.laterite },
  totalLabel: { fontSize: 8, color: c.muted, marginBottom: 4, letterSpacing: 1 },
  totalValue: { fontFamily: 'Helvetica-Bold', fontSize: 13.5 },
  totalHint: { fontSize: 8, color: c.muted, marginTop: 3 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginTop: 6, marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: c.line, paddingVertical: 6 },
  cellLabel: { width: '40%', color: c.muted },
  cellValue: { width: '60%', fontFamily: 'Helvetica-Bold' },
  step: { flexDirection: 'row', marginBottom: 4 },
  stepNum: { width: 18, color: c.laterite, fontFamily: 'Helvetica-Bold' },
  disclaimer: { marginTop: 16, padding: 10, borderWidth: 0.5, borderColor: c.line, fontSize: 8, color: c.muted, lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: c.muted, borderTopWidth: 0.5, borderTopColor: c.line, paddingTop: 8 },
})

export type PreQuoteLabels = {
  eyebrow: string
  title: string
  subtitle: string
  reference: string
  date: string
  budget: string
  budgetHint: string
  duration: string
  durationHint: string
  details: string
  steps: string
  disclaimer: string
  preparedFor?: string
}

export type PreQuoteData = {
  labels: PreQuoteLabels
  reference: string
  dateText: string
  rows: { label: string; value: string }[]
  result: Extract<SimulatorResult, { ok: true }>
  costText: string
  durationText: string
  steps: string[]
  company: { name: string; tagline?: string | null; contact: string; url: string }
}

/** Les espaces insécables fines de l'API Intl ne sont pas dans les polices standard du PDF. */
const clean = (text: string) => text.replace(/[  ]/g, ' ')

function PreQuote({ data }: { data: PreQuoteData }) {
  const { labels } = data
  return (
    <Document title={`${labels.title} ${data.reference}`} author={data.company.name} subject={labels.title} language="fr">
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={s.mono}>AD</Text>
            <View>
              <Text style={s.brand}>ARCHI-DESIGN</Text>
              <Text style={s.brandSub}>GUINÉE</Text>
            </View>
          </View>
          <View>
            <Text style={s.bandRight}>
              {labels.reference} {data.reference}
            </Text>
            <Text style={s.bandRight}>
              {labels.date} {clean(data.dateText)}
            </Text>
          </View>
        </View>
        <View style={s.frise} />

        <View style={s.body}>
          <Text style={s.eyebrow}>{labels.eyebrow.toUpperCase()}</Text>
          <Text style={s.title}>{labels.title}</Text>
          <Text style={s.subtitle}>{clean(labels.preparedFor ?? labels.subtitle)}</Text>

          <View style={s.totals}>
            <View style={[s.totalBox, { flex: 1.6 }]}>
              <Text style={s.totalLabel}>{labels.budget.toUpperCase()}</Text>
              <Text style={s.totalValue}>{clean(data.costText)}</Text>
              <Text style={s.totalHint}>{clean(labels.budgetHint)}</Text>
            </View>
            <View style={[s.totalBox, { borderLeftColor: c.fouta }]}>
              <Text style={s.totalLabel}>{labels.duration.toUpperCase()}</Text>
              <Text style={s.totalValue}>{clean(data.durationText)}</Text>
              <Text style={s.totalHint}>{clean(labels.durationHint)}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>{labels.details}</Text>
          {data.rows.map((row) => (
            <View key={row.label} style={s.row}>
              <Text style={s.cellLabel}>{row.label}</Text>
              <Text style={s.cellValue}>{clean(row.value)}</Text>
            </View>
          ))}

          <Text style={[s.sectionTitle, { marginTop: 16 }]}>{labels.steps}</Text>
          {data.steps.map((step, i) => (
            <View key={step} style={s.step}>
              <Text style={s.stepNum}>{i + 1}.</Text>
              <Text>{step}</Text>
            </View>
          ))}

          <Text style={s.disclaimer}>{clean(labels.disclaimer)}</Text>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {data.company.name}
            {data.company.tagline ? ` · ${data.company.tagline}` : ''}
          </Text>
          <Text>{clean(data.company.contact)}</Text>
          <Text>{data.company.url}</Text>
        </View>
      </Page>
    </Document>
  )
}

export function renderPreQuote(data: PreQuoteData): Promise<Buffer> {
  return renderToBuffer(<PreQuote data={data} />)
}
