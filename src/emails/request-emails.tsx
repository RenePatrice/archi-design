import { Button, Heading, Text } from '@react-email/components'

import { buttonStyle, colors, EmailLayout, LinesTable, mono, SummaryTable, type EmailLine } from './layout'

/** Données communes aux deux e-mails d'une demande. */
export type RequestEmailData = {
  number: string | null
  serviceLabel: string
  date: string
  customerName: string
  customerPhone: string
  rows: { label: string; value: string }[]
  lines?: EmailLine[]
  total?: string
}

/**
 * E-mail reçu par l'entreprise : toutes les informations de la demande et du client,
 * avec des boutons pour répondre tout de suite sur WhatsApp ou appeler.
 */
export function CompanyRequestEmail({
  data,
  intro,
  whatsappUrl,
  callUrl,
  attachmentNames,
  adminUrl,
}: {
  data: RequestEmailData
  intro?: string | null
  whatsappUrl: string | null
  callUrl: string
  attachmentNames: string[]
  adminUrl: string | null
}) {
  return (
    <EmailLayout
      lang="fr"
      preview={`${data.serviceLabel} ${data.number ?? ''} · ${data.customerName}, ${data.customerPhone}`}
      footer={
        <Text style={{ margin: 0, fontSize: 12, color: colors.muted }}>
          Demande enregistrée dans le back-office. Pensez à mettre à jour son statut après avoir contacté le client.
          {adminUrl && (
            <>
              {' '}
              <a href={adminUrl} style={{ color: colors.laterite }}>
                Ouvrir la demande
              </a>
            </>
          )}
        </Text>
      }
    >
      <Text style={{ margin: '0 0 4px', fontFamily: mono, fontSize: 12, color: colors.laterite, letterSpacing: 1 }}>
        {data.serviceLabel.toUpperCase()}
        {data.number ? ` · ${data.number}` : ''}
      </Text>
      <Heading as="h1" style={{ margin: '0 0 8px', fontSize: 22, color: colors.forge }}>
        {data.customerName}
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 14, color: colors.muted }}>
        {data.customerPhone} · {data.date}
      </Text>

      {intro && <Text style={{ fontSize: 14, color: colors.forge, whiteSpace: 'pre-line' }}>{intro}</Text>}

      <div>
        {whatsappUrl && (
          <Button href={whatsappUrl} style={buttonStyle('#1f7a4d')}>
            Répondre sur WhatsApp
          </Button>
        )}
        <Button href={callUrl} style={buttonStyle(colors.laterite)}>
          Appeler
        </Button>
      </div>

      {data.lines && data.lines.length > 0 && (
        <LinesTable
          lines={data.lines}
          headers={['Produit', 'Qté', 'Prix unit.', 'Sous-total']}
          totalLabel="Total indicatif"
          total={data.total ?? ''}
        />
      )}

      <SummaryTable rows={data.rows} />

      {attachmentNames.length > 0 && (
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Fichiers joints ({attachmentNames.length}) : {attachmentNames.join(', ')}
        </Text>
      )}
    </EmailLayout>
  )
}

/** Accusé de réception envoyé au client, dans sa langue, au ton chaleureux. */
export function CustomerAckEmail({
  data,
  lang,
  intro,
  delay,
  outro,
  labels,
  companyWhatsappUrl,
  companyContact,
}: {
  data: RequestEmailData
  lang: string
  intro: string
  delay?: string | null
  outro?: string | null
  labels: { number: string; summary: string; whatsapp: string; product: string; qty: string; unitPrice: string; subtotal: string; total: string }
  companyWhatsappUrl: string | null
  companyContact: string
}) {
  return (
    <EmailLayout
      lang={lang}
      preview={intro.slice(0, 120)}
      footer={<Text style={{ margin: 0, fontSize: 12, color: colors.muted, whiteSpace: 'pre-line' }}>{companyContact}</Text>}
    >
      <Heading as="h1" style={{ margin: '0 0 12px', fontSize: 22, color: colors.forge }}>
        {data.serviceLabel}
      </Heading>
      <Text style={{ fontSize: 15, color: colors.forge, whiteSpace: 'pre-line', lineHeight: '1.6' }}>{intro}</Text>

      {data.number && (
        <Text style={{ margin: '16px 0', padding: '12px 14px', backgroundColor: colors.kaolin, fontSize: 14 }}>
          {labels.number} <strong style={{ fontFamily: mono, fontSize: 16, color: colors.laterite }}>{data.number}</strong>
        </Text>
      )}
      {delay && <Text style={{ fontSize: 14, color: colors.fouta, fontWeight: 700 }}>{delay}</Text>}

      <Heading as="h2" style={{ fontSize: 16, margin: '20px 0 4px', color: colors.forge }}>
        {labels.summary}
      </Heading>
      {data.lines && data.lines.length > 0 && (
        <LinesTable
          lines={data.lines}
          headers={[labels.product, labels.qty, labels.unitPrice, labels.subtotal]}
          totalLabel={labels.total}
          total={data.total ?? ''}
        />
      )}
      <SummaryTable rows={data.rows} />

      {companyWhatsappUrl && (
        <Button href={companyWhatsappUrl} style={buttonStyle('#1f7a4d')}>
          {labels.whatsapp}
        </Button>
      )}
      {outro && <Text style={{ fontSize: 14, color: colors.forge, whiteSpace: 'pre-line' }}>{outro}</Text>}
    </EmailLayout>
  )
}
