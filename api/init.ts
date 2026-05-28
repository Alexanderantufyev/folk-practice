import type { VercelRequest, VercelResponse } from '@vercel/node'
import { initDb } from './_db'
import { isAuthenticated } from './_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: 'DATABASE_URL не задан. Подключите Neon Postgres в Vercel Storage.',
    })
  }

  try {
    await initDb()
    return res.status(200).json({ ok: true, message: 'База данных инициализирована' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return res.status(500).json({ error: message })
  }
}
