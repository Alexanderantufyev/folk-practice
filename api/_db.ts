import { neon } from '@neondatabase/serverless'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL не задан')
  return neon(url)
}

export async function initDb() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'masterclass',
      phase INTEGER NOT NULL DEFAULT 1,
      status VARCHAR(20) NOT NULL DEFAULT 'planned',

      planned_date_from DATE,
      planned_date_to DATE,
      actual_date_from DATE,
      actual_date_to DATE,

      location TEXT NOT NULL DEFAULT '',
      max_participants INTEGER NOT NULL DEFAULT 20,

      qualitative_result TEXT NOT NULL DEFAULT '',
      media_publications INTEGER NOT NULL DEFAULT 0,
      media_reach INTEGER NOT NULL DEFAULT 0,
      vk_post_url TEXT NOT NULL DEFAULT '',
      yandex_disk_url TEXT NOT NULL DEFAULT '',
      media_links TEXT[] NOT NULL DEFAULT '{}',
      comment TEXT NOT NULL DEFAULT '',

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      age INTEGER,
      attended BOOLEAN NOT NULL DEFAULT FALSE,
      registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_events_phase ON events(phase)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_photos_event ON photos(event_id)`
}
