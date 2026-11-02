import { Body, Container, Head, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { ReactNode } from 'react'

/*
 * Mise en page commune des e-mails, aux couleurs de la charte.
 * Les e-mails n'acceptent que des styles en ligne et des tableaux : pas de Tailwind ici.
 */

export const colors = {
  laterite: '#A0521E',
  fouta: '#1F4A3A',
  leppi: '#24305E',
  forge: '#1C1E1D',
  kaolin: '#F2F1EC',
  sable: '#E0A46A',
  muted: '#4E5752',
  line: '#D6D6CE',
}

export const font = "'Segoe UI', Helvetica, Arial, sans-serif"
export const mono = "Consolas, 'Courier New', monospace"

export function EmailLayout({ preview, lang, children, footer }: { preview: string; lang: string; children: ReactNode; footer: ReactNode }) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.kaolin, fontFamily: font, margin: 0, padding: '24px 0' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#ffffff', border: `1px solid ${colors.line}` }}>
          {/* Bandeau : monogramme et nom, en attendant le logo officiel */}
          <Section style={{ backgroundColor: colors.fouta, padding: '18px 24px' }}>
            <Text style={{ margin: 0, color: colors.kaolin, fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
              <span style={{ backgroundColor: colors.laterite, color: '#fff', padding: '2px 7px', marginRight: 10 }}>AD</span>
              ARCHI-DESIGN <span style={{ fontSize: 11, fontWeight: 400, letterSpacing: 3, color: colors.sable }}>GUINÉE</span>
            </Text>
          </Section>
          {/* Frise latérite / indigo, rappel du site */}
          <Section style={{ height: 6, backgroundColor: colors.laterite, borderBottom: `4px solid ${colors.leppi}` }} />
          <Section style={{ padding: '24px' }}>{children}</Section>
          <Hr style={{ borderColor: colors.line, margin: 0 }} />
          <Section style={{ padding: '16px 24px' }}>{footer}</Section>
        </Container>
      </Body>
    </Html>
  )
}

/** Tableau récapitulatif « libellé : valeur ». */
export function SummaryTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: 'collapse', margin: '8px 0 16px' }}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`${row.label}-${i}`}>
            <td style={{ padding: '8px 10px 8px 0', borderBottom: `1px solid ${colors.line}`, color: colors.muted, fontSize: 13, width: '38%', verticalAlign: 'top' }}>
              {row.label}
            </td>
            <td style={{ padding: '8px 0', borderBottom: `1px solid ${colors.line}`, color: colors.forge, fontSize: 14, whiteSpace: 'pre-line', verticalAlign: 'top' }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export type EmailLine = { reference: string; name: string; quantity: number; unitPrice: string; subtotal: string }

/** Lignes de commande de la boutique. */
export function LinesTable({ lines, totalLabel, total, headers }: { lines: EmailLine[]; totalLabel: string; total: string; headers: [string, string, string, string] }) {
  const th = { textAlign: 'left' as const, fontSize: 12, color: colors.muted, padding: '6px 6px 6px 0', borderBottom: `2px solid ${colors.forge}` }
  const td = { fontSize: 13, padding: '8px 6px 8px 0', borderBottom: `1px solid ${colors.line}`, verticalAlign: 'top' as const }
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ borderCollapse: 'collapse', margin: '8px 0 16px' }}>
      <thead>
        <tr>
          <th style={th}>{headers[0]}</th>
          <th style={{ ...th, textAlign: 'right' }}>{headers[1]}</th>
          <th style={{ ...th, textAlign: 'right' }}>{headers[2]}</th>
          <th style={{ ...th, textAlign: 'right' }}>{headers[3]}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.reference}>
            <td style={td}>
              {line.name}
              <br />
              <span style={{ fontFamily: mono, fontSize: 11, color: colors.muted }}>{line.reference}</span>
            </td>
            <td style={{ ...td, textAlign: 'right' }}>{line.quantity}</td>
            <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{line.unitPrice}</td>
            <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{line.subtotal}</td>
          </tr>
        ))}
        <tr>
          <td colSpan={3} style={{ ...td, fontWeight: 700, borderBottom: 'none' }}>
            {totalLabel}
          </td>
          <td style={{ ...td, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', borderBottom: 'none' }}>{total}</td>
        </tr>
      </tbody>
    </table>
  )
}

export const buttonStyle = (background: string, color = '#ffffff') => ({
  backgroundColor: background,
  color,
  fontSize: 15,
  fontWeight: 700,
  padding: '12px 18px',
  textDecoration: 'none',
  display: 'inline-block',
  marginRight: 8,
  marginBottom: 8,
})
