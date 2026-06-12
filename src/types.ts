export interface ClassEvent {
  id: string
  date: string          // YYYY-MM-DD
  title: string
  description: string
  time: string          // "18:00"
  duration?: string     // "2 часа"
  location?: string
  images: string[]      // image URLs
  formUrl: string       // Yandex Form URL
  maxParticipants?: number
  currentParticipants: number
  price?: number
}
