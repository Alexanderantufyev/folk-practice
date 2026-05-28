import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from '../_db'
import { isAuthenticated } from '../_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getDb()
  const { id } = req.query as { id: string }

  // GET — event detail (public: for registration form)
  if (req.method === 'GET') {
    const [event] = await sql`
      SELECT e.*,
        COUNT(r.id)::int AS registrations_count,
        COUNT(r.id) FILTER (WHERE r.attended)::int AS attended_count
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      WHERE e.id = ${id}
      GROUP BY e.id`
    if (!event) return res.status(404).json({ error: 'Not found' })

    const photos = await sql`SELECT * FROM photos WHERE event_id = ${id} ORDER BY order_index`
    return res.status(200).json({ event, photos })
  }

  // PUT — update event (admin)
  if (req.method === 'PUT') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const b = req.body
    const [row] = await sql`
      UPDATE events SET
        title = ${b.title}, type = ${b.type}, phase = ${b.phase}, status = ${b.status},
        planned_date_from = ${b.planned_date_from || null}, planned_date_to = ${b.planned_date_to || null},
        actual_date_from = ${b.actual_date_from || null}, actual_date_to = ${b.actual_date_to || null},
        location = ${b.location ?? ''}, max_participants = ${b.max_participants ?? 20},
        qualitative_result = ${b.qualitative_result ?? ''},
        media_publications = ${b.media_publications ?? 0}, media_reach = ${b.media_reach ?? 0},
        vk_post_url = ${b.vk_post_url ?? ''}, yandex_disk_url = ${b.yandex_disk_url ?? ''},
        media_links = ${b.media_links ?? []}, comment = ${b.comment ?? ''},
        updated_at = NOW()
      WHERE id = ${id} RETURNING *`
    return res.status(200).json({ event: row })
  }

  // DELETE (admin)
  if (req.method === 'DELETE') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    await sql`DELETE FROM events WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
