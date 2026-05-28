import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../../_db'
import { isAuthenticated } from '../../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getDb()
  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const rows = await sql`
      SELECT * FROM registrations WHERE event_id = ${id} ORDER BY registered_at ASC`
    return res.status(200).json({ registrations: rows })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
