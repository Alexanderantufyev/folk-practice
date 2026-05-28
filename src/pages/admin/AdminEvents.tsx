import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Users, ExternalLink } from 'lucide-react'
import type { Event } from '../../types'
import { EVENT_TYPE_LABELS } from '../../types'
import { formatDate } from '../../utils/format'

const TYPE_COLORS: Record<string, string> = {
  masterclass: 'bg-blue-50 text-blue-700',
  vechorka: 'bg-purple-50 text-purple-700',
  festival: 'bg-amber-50 text-amber-700',
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-slate-100 text-slate-600',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Запланировано',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'all' | '1' | '2'>('all')

  const load = () => {
    setLoading(true)
    const url = phase !== 'all' ? `/api/events?admin=1&phase=${phase}` : '/api/events?admin=1'
    fetch(url).then((r) => r.json()).then((d) => setEvents(d.events ?? [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [phase])

  const total = events.length
  const totalGuests = events.reduce((s, e) => s + (e.registrations_count ?? 0), 0)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Мероприятия</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} встреч · {totalGuests} записей</p>
        </div>
        <Link to="/admin/events/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus size={15} /> Добавить
        </Link>
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 mb-5">
        {(['all', '1', '2'] as const).map((p) => (
          <button key={p} onClick={() => setPhase(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${phase === p ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {p === 'all' ? 'Все' : `Этап ${p}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>Мероприятий нет</p>
          <Link to="/admin/events/new" className="mt-3 inline-block text-emerald-600 hover:underline text-sm">Добавить первое</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Link key={event.id} to={`/admin/events/${event.id}`}
              className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-3.5 hover:border-emerald-200 hover:shadow-sm transition-all group">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[event.type]}`}>
                    {EVENT_TYPE_LABELS[event.type]}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status]}`}>
                    {STATUS_LABELS[event.status]}
                  </span>
                  <span className="text-[11px] text-slate-400">Этап {event.phase}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{event.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {(event.actual_date_from || event.planned_date_from) && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(event.actual_date_from ?? event.planned_date_from ?? '')}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {event.registrations_count ?? 0} / {event.max_participants}
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-500 shrink-0 ml-4 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
