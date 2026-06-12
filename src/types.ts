export type Master = 'Кожа' | 'Дерево' | 'Ткань' | 'Песни' | 'Танцы'
export type Venue = 'indoor' | 'outdoor'

export const MASTERS: Master[] = ['Кожа', 'Дерево', 'Ткань', 'Песни', 'Танцы']
export const VENUE_LABELS: Record<Venue, string> = {
  indoor: 'В доме',
  outdoor: 'Снаружи',
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
