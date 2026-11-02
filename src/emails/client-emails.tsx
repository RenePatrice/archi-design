import { Button, Heading, Text } from '@react-email/components'

import { buttonStyle, colors, EmailLayout, mono } from './layout'

/**
 * E-mail de notification de l'espace client : nouvelle actualité, nouveau document ou message.
 * Volontairement court : le contenu complet se lit dans l'espace client (connexion requise).
 */
export function ClientNotificationEmail({
  lang,
  eyebrow,
  title,
  intro,
  excerpt,
  buttonLabel,
  url,
  footer,
}: {
  lang: string
  eyebrow: string
  title: string
  intro: string
  excerpt?: string | null
  buttonLabel: string
  url: string
  footer: string
}) {
  return (
    <EmailLayout
      lang={lang}
      preview={`${eyebrow} · ${title}`}
      footer={<Text style={{ margin: 0, fontSize: 12, color: colors.muted, whiteSpace: 'pre-line' }}>{footer}</Text>}
    >
      <Text style={{ margin: '0 0 4px', fontFamily: mono, fontSize: 12, color: colors.laterite, letterSpacing: 1 }}>{eyebrow.toUpperCase()}</Text>
      <Heading as="h1" style={{ margin: '0 0 12px', fontSize: 22, color: colors.forge }}>
        {title}
      </Heading>
      <Text style={{ fontSize: 15, color: colors.forge, lineHeight: '1.6' }}>{intro}</Text>
      {excerpt && (
        <Text style={{ fontSize: 14, color: colors.forge, backgroundColor: colors.kaolin, padding: '12px 14px', borderLeft: `4px solid ${colors.fouta}`, whiteSpace: 'pre-line' }}>
          {excerpt}
        </Text>
      )}
      <Button href={url} style={buttonStyle(colors.laterite)}>
        {buttonLabel}
      </Button>
    </EmailLayout>
  )
}
