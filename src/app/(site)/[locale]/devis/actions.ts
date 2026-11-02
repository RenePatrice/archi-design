'use server'

import { processRequest, type RequestState } from '@/lib/requests/process'

/** Action serveur commune à tous les formulaires de demande (devis, impression, boutique, formations). */
export async function submitRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  return processRequest(formData)
}
