import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../_db'
import { isAuthenticated } from '../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  const sql = getDb()
  const { id } = req.query as { id: string }

  if (req.method === 'PUT') {
    const { attended } = req.body as { attended: boolean }
    const [row] = await sql`
      UPDATE registrations SET attended = ${attended} WHERE id = ${id} RETURNING *`
    return res.status(200).json({ registration: row })
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM registrations WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
