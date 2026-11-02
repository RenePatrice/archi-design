import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/utils'

/** Affiche un texte riche saisi dans le back-office, avec la typographie du site. */
export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      className={cn(
        'flex max-w-[68ch] flex-col gap-4 text-ink [&_a]:text-accent [&_a]:underline [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc',
        className,
      )}
    />
  )
}
