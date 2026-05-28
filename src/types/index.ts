export type EventType = 'masterclass' | 'vechorka' | 'festival'
export type EventStatus = 'planned' | 'completed' | 'cancelled'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  masterclass: 'Мастер-класс',
  vechorka: 'Вечёрка',
  festival: 'Фестиваль',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  planned: 'Запланировано',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export interface Event {
  id: string
  title: string
  type: EventType
  phase: 1 | 2
  status: EventStatus

  planned_date_from: string | null
  planned_date_to: string | null
  actual_date_from: string | null
  actual_date_to: string | null

  location: string
  max_participants: number

  // Report fields
  qualitative_result: string
  media_publications: number
  media_reach: number
  vk_post_url: string
  yandex_disk_url: string
  media_links: string[]
  comment: string

  // Computed from registrations
  registrations_count?: number
  attended_count?: number

  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  event_id: string
  url: string
  order_index: number
  created_at: string
}

export interface Registration {
  id: string
  event_id: string
  name: string
  phone: string
  age: number | null
  attended: boolean
  registered_at: string
}
