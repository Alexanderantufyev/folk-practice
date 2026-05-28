import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react'
import type { Event } from '../types'
import { EVENT_TYPE_LABELS } from '../types'
import { formatDate } from '../utils/format'

export function RegisterPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', age: '' })

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => { if (!r.ok) setNotFound(true); return r.json() })
      .then((d) => { if (d.event) setEvent(d.event) })
      .finally(() => setLoading(false))
  }, [id])

  const isFull = event ? (event.registrations_count ?? 0) >= event.max_participants : false

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setError('Заполните имя и телефон'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: id, ...form, age: form.age ? Number(form.age) : null }),
      })
      const data = await res.json()
      if (res.ok) setSubmitted(true)
      else setError(data.error ?? 'Ошибка записи')
    } catch { setError('Нет связи с сервером') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-4xl mb-3">🍃</div>
        <p className="text-slate-500">Мероприятие не найдено</p>
        <Link to="/" className="mt-4 inline-block text-emerald-600 hover:underline text-sm">← На главную</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-sm text-emerald-600 hover:underline mb-6 inline-block">← Все встречи</Link>

        {/* Event info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {event ? EVENT_TYPE_LABELS[event.type] : ''}
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 mb-3">{event?.title}</h1>
          <div className="space-y-1.5 text-sm text-slate-500">
            {(event?.actual_date_from || event?.planned_date_from) && (
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{formatDate(event?.actual_date_from ?? event?.planned_date_from ?? '')}</span>
              </div>
            )}
            {event?.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>{isFull ? 'Все места заняты' : `Свободно: ${event!.max_participants - (event!.registrations_count ?? 0)} из ${event!.max_participants}`}</span>
            </div>
          </div>
        </div>

        {/* Form or success */}
        {submitted ? (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 text-center">
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Вы записаны!</h2>
            <p className="text-sm text-slate-500">До встречи на мероприятии «{event?.title}»</p>
          </div>
        ) : isFull ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <p className="text-slate-500">Запись закрыта — все места заняты.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Запись на встречу</h2>

            <Field label="Имя и фамилия *">
              <input type="text" value={form.name} placeholder="Иванова Мария"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input" required />
            </Field>

            <Field label="Телефон *">
              <input type="tel" value={form.phone} placeholder="+7 900 000-00-00"
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input" required />
            </Field>

            <Field label="Возраст">
              <input type="number" value={form.age} placeholder="35" min="1" max="120"
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="input" />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors">
              {submitting ? 'Отправляем...' : 'Записаться'}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Нажимая кнопку, вы соглашаетесь на обработку персональных данных
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}
