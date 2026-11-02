/**
 * Données structurées schema.org, lues par Google pour enrichir les résultats
 * (fiche entreprise, fil d'Ariane…). Le contenu est échappé pour éviter toute injection.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
