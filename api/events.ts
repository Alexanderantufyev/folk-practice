import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_db'
import { isAuthenticated } from './_auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = getDb()

  // GET — public list (upcoming events for registration page)
  if (req.method === 'GET') {
    const { admin, phase } = req.query
    if (admin === '1' && !isAuthenticated(req)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const rows = phase
      ? await sql`
          SELECT e.*,
            COUNT(r.id)::int AS registrations_count,
            COUNT(r.id) FILTER (WHERE r.attended)::int AS attended_count
          FROM events e
          LEFT JOIN registrations r ON r.event_id = e.id
          WHERE e.phase = ${Number(phase)}
          GROUP BY e.id
          ORDER BY e.actual_date_from ASC NULLS LAST, e.planned_date_from ASC NULLS LAST, e.created_at ASC`
      : await sql`
          SELECT e.*,
            COUNT(r.id)::int AS registrations_count,
            COUNT(r.id) FILTER (WHERE r.attended)::int AS attended_count
          FROM events e
          LEFT JOIN registrations r ON r.event_id = e.id
          GROUP BY e.id
          ORDER BY e.actual_date_from ASC NULLS LAST, e.planned_date_from ASC NULLS LAST, e.created_at ASC`

    return res.status(200).json({ events: rows })
  }

  // POST — create event (admin)
  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' })
    const b = req.body
    const [row] = await sql`
      INSERT INTO events (title, type, phase, status, planned_date_from, planned_date_to,
        actual_date_from, actual_date_to, location, max_participants,
        qualitative_result, media_publications, media_reach,
        vk_post_url, yandex_disk_url, media_links, comment)
      VALUES (${b.title}, ${b.type ?? 'masterclass'}, ${b.phase ?? 1}, ${b.status ?? 'planned'},
        ${b.planned_date_from || null}, ${b.planned_date_to || null},
        ${b.actual_date_from || null}, ${b.actual_date_to || null},
        ${b.location ?? ''}, ${b.max_participants ?? 20},
        ${b.qualitative_result ?? ''}, ${b.media_publications ?? 0}, ${b.media_reach ?? 0},
        ${b.vk_post_url ?? ''}, ${b.yandex_disk_url ?? ''}, ${b.media_links ?? []}, ${b.comment ?? ''})
      RETURNING *`
    return res.status(201).json({ event: row })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
