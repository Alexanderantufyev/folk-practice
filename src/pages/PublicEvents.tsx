import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { Event } from '../types'
import { EVENT_TYPE_LABELS } from '../types'
import { formatDate } from '../utils/format'

export function PublicEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setEvents((d.events ?? []).filter((e: Event) => e.status !== 'cancelled')))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = events.filter((e) => e.status === 'planned')
  const past = events.filter((e) => e.status === 'completed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <div className="text-3xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-slate-900">Фольклорные практики в городе</h1>
          <p className="text-slate-500 text-sm mt-1">Проект «Поморцы» при поддержке ПФКИ</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ближайшие встречи</h2>
            <div className="space-y-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {!loading && past.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-500 mb-4">Прошедшие встречи</h2>
            <div className="space-y-3 opacity-70">
              {past.map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          </section>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🌱</div>
            <p>Встречи скоро появятся</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, past }: { event: Event; past?: boolean }) {
  const isFull = (event.registrations_count ?? 0) >= event.max_participants
  const spots = event.max_participants - (event.registrations_count ?? 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            <h3 className="text-base font-semibold text-slate-900 mt-2">{event.title}</h3>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-slate-500">
          {(event.actual_date_from || event.planned_date_from) && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" />
              <span>{formatDate(event.actual_date_from ?? event.planned_date_from ?? '')}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          {!past && (
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0" />
              <span>{isFull ? 'Все места заняты' : `Свободно мест: ${spots}`}</span>
            </div>
          )}
        </div>

        {!past && (
          <div className="mt-4">
            {isFull ? (
              <span className="inline-block px-4 py-2 text-sm text-slate-400 bg-slate-50 rounded-xl">
                Запись закрыта
              </span>
            ) : (
              <Link
                to={`/register/${event.id}`}
                className="inline-block px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                Записаться
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
