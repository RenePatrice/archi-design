import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/**
 * Point de contrôle pour la surveillance (UptimeRobot, Coolify…) : /health
 * Répond 200 si le site et la base de données fonctionnent, 503 sinon.
 */
export async function GET() {
  const started = Date.now()
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'poles' })
    return Response.json({ status: 'ok', database: 'ok', ms: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'error', database: 'unreachable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
