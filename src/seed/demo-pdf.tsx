import { Document, Page, Rect, renderToBuffer, Line, Svg, Text, View } from '@react-pdf/renderer'

/**
 * Plan PDF de démonstration pour l'espace client (un rez-de-chaussée schématique).
 * À remplacer par les vrais plans exportés d'AutoCAD ou Revit.
 */
export function buildDemoPlanPdf(title: string): Promise<Buffer> {
  const ink = '#1C1E1D'
  return renderToBuffer(
    <Document title={title} author="ARCHI-DESIGN Guinée">
      <Page size="A4" orientation="landscape" style={{ padding: 36, fontFamily: 'Helvetica', fontSize: 9, color: ink }}>
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 16, marginBottom: 4 }}>{title}</Text>
        <Text style={{ color: '#4E5752', marginBottom: 16 }}>Plan de démonstration · échelle indicative 1/100</Text>
        <Svg width={600} height={360} viewBox="0 0 600 360">
          {/* Murs extérieurs et cloisons */}
          <Rect x={20} y={20} width={560} height={320} stroke={ink} strokeWidth={4} fill="#F2F1EC" />
          <Line x1={260} y1={20} x2={260} y2={200} stroke={ink} strokeWidth={2} />
          <Line x1={20} y1={200} x2={420} y2={200} stroke={ink} strokeWidth={2} />
          <Line x1={420} y1={200} x2={420} y2={340} stroke={ink} strokeWidth={2} />
          {/* Baies */}
          <Rect x={80} y={16} width={120} height={8} fill="#24305E" />
          <Rect x={340} y={16} width={160} height={8} fill="#24305E" />
          <Rect x={576} y={240} width={8} height={60} fill="#24305E" />
          {/* Terrasse couverte */}
          <Rect x={20} y={340} width={560} height={14} fill="#A0521E" />
        </Svg>
        <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
          <Text>Séjour 32 m²</Text>
          <Text>Cuisine 14 m²</Text>
          <Text>Chambre 1 · 14 m²</Text>
          <Text>Terrasse couverte 18 m²</Text>
        </View>
      </Page>
    </Document>,
  )
}
