import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../../_db'
import { isAuthenticated } from '../../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getDb()
  const { id } = req.query as { id: string }

  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { url } = req.body as { url: string }
    const [count] = await sql`SELECT COUNT(*)::int AS n FROM photos WHERE event_id = ${id}`
    const [row] = await sql`
      INSERT INTO photos (event_id, url, order_index) VALUES (${id}, ${url}, ${count.n}) RETURNING *`
    return res.status(201).json({ photo: row })
  }

  if (req.method === 'DELETE') {
    const { photoId } = req.body as { photoId: string }
    await sql`DELETE FROM photos WHERE id = ${photoId} AND event_id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
