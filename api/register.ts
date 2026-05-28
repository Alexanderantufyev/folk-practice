import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sql = getDb()
  const { event_id, name, phone, age } = req.body as {
    event_id: string; name: string; phone: string; age?: number
  }

  if (!event_id || !name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' })
  }

  // Check event exists and has seats
  const [event] = await sql`SELECT * FROM events WHERE id = ${event_id}`
  if (!event) return res.status(404).json({ error: 'Мероприятие не найдено' })

  const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM registrations WHERE event_id = ${event_id}`
  if (n >= event.max_participants) {
    return res.status(409).json({ error: 'Все места заняты' })
  }

  // Check duplicate phone
  const [dup] = await sql`
    SELECT id FROM registrations WHERE event_id = ${event_id} AND phone = ${phone.trim()}`
  if (dup) {
    return res.status(409).json({ error: 'Вы уже записаны на это мероприятие' })
  }

  const [reg] = await sql`
    INSERT INTO registrations (event_id, name, phone, age)
    VALUES (${event_id}, ${name.trim()}, ${phone.trim()}, ${age || null})
    RETURNING *`

  return res.status(201).json({ ok: true, registration: reg })
}
