import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Vide le cache des pages publiques après une modification dans le back-office,
 * pour que le site affiche immédiatement le nouveau contenu.
 */
async function revalidateSite() {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Hors de Next.js (seed, migrations) : il n'y a pas de cache à vider
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidateSite()
  return doc
}
