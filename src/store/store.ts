import { create } from 'zustand'
import toast from 'react-hot-toast'
import type { ClassEvent } from '../types'

const REST_URL = import.meta.env.VITE_UPSTASH_REST_URL as string | undefined
const REST_TOKEN = import.meta.env.VITE_UPSTASH_REST_TOKEN as string | undefined

async function redisGet(): Promise<ClassEvent[]> {
  if (!REST_URL || !REST_TOKEN) return []
  try {
    const res = await fetch(REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', 'lad-bereg-events']),
    })
    if (!res.ok) { toast.error(`Ошибка загрузки: ${res.status}`); return [] }
    const data = await res.json() as { result: string | null }
    if (!data.result) return []
    return JSON.parse(data.result) as ClassEvent[]
  } catch {
    return []
  }
}

async function redisSet(events: ClassEvent[]): Promise<void> {
  if (!REST_URL || !REST_TOKEN) return
  try {
    const res = await fetch(REST_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', 'lad-bereg-events', JSON.stringify(events)]),
    })
    if (!res.ok) toast.error(`Ошибка сохранения: ${res.status}`)
  } catch {
    toast.error('Нет соединения с базой')
  }
}

interface AppStore {
  events: ClassEvent[]
  isLoading: boolean
  currentMonth: Date

  loadEvents: () => Promise<void>
  saveEvent: (event: ClassEvent) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  setCurrentMonth: (date: Date) => void
  getEventsForDate: (date: string) => ClassEvent[]
}

export const useStore = create<AppStore>((set, get) => ({
  events: [],
  isLoading: false,
  currentMonth: new Date(),

  loadEvents: async () => {
    set({ isLoading: true })
    const events = await redisGet()
    set({ events, isLoading: false })
  },

  saveEvent: async (event) => {
    const existing = get().events
    const idx = existing.findIndex(e => e.id === event.id)
    const updated = idx >= 0
      ? existing.map(e => e.id === event.id ? event : e)
      : [...existing, event]
    set({ events: updated })
    await redisSet(updated)
  },

  deleteEvent: async (id) => {
    const updated = get().events.filter(e => e.id !== id)
    set({ events: updated })
    await redisSet(updated)
  },

  setCurrentMonth: (date) => set({ currentMonth: date }),

  getEventsForDate: (date) => get().events.filter(e => e.date === date),
}))
