/**
 * Construit le format JSON de l'éditeur Lexical (texte riche Payload) à partir de texte brut.
 * Une ligne commençant par « ## » devient un intertitre, les autres des paragraphes.
 */
const text = (value: string) => ({ type: 'text', text: value, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })

const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

export function richText(...lines: string[]) {
  return {
    root: {
      type: 'root',
      ...block,
      children: lines.map((line) =>
        line.startsWith('## ')
          ? { type: 'heading', tag: 'h2', ...block, children: [text(line.slice(3))] }
          : { type: 'paragraph', ...block, textFormat: 0, textStyle: '', children: [text(line)] },
      ),
    },
  }
}
