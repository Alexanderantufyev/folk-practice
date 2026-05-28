import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDb } from './_db'
import { isAuthenticated } from './_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
  await initDb()
  return res.status(200).json({ ok: true, message: 'Database initialized' })
}
