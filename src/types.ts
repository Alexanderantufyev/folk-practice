export type Master = 'Карлос' | 'Разумов' | 'Зарапина'
export type Venue = 'indoor' | 'outdoor'

export const MASTERS: Master[] = ['Карлос', 'Разумов', 'Зарапина']
export const VENUE_LABELS: Record<Venue, string> = {
  indoor: 'В доме',
  outdoor: 'В уличной мастерской',
}

export interface ClassEvent {
  id: string
  date: string
  master: Master
  title: string
  description: string
  duration: string
  forChildren: boolean
  maxParticipants: number
  venue: Venue
  images: string[]
  time?: string
}
