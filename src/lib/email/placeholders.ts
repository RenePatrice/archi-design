/** Remplace {numero}, {client}, {type}, {formation}, {date} dans un texte de modèle d'e-mail. */
export function fillPlaceholders(template: string, values: Record<string, string | null | undefined>): string {
  return template
    .replace(/\{(\w+)\}/g, (_match, key: string) => values[key] ?? '')
    .replace(/\s+[–-]\s*$/, '') // retire un tiret final si la variable est vide
    .trim()
}
