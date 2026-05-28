import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, ExternalLink, Plus, X, Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Event, Registration, Photo } from '../../types'
import { EVENT_TYPE_LABELS } from '../../types'
import { formatDateRange } from '../../utils/format'

export function AdminEventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [evRes, regRes] = await Promise.all([
      fetch(`/api/events/${id}`),
      fetch(`/api/events/${id}/registrations`),
    ])
    const evData = await evRes.json()
    const regData = await regRes.json()
    setEvent(evData.event ?? null)
    setPhotos(evData.photos ?? [])
    setRegistrations(regData.registrations ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const deleteEvent = async () => {
    if (!confirm('Удалить мероприятие? Все записи гостей тоже удалятся.')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    toast.success('Мероприятие удалено')
    navigate('/admin/events')
  }

  const toggleAttended = async (reg: Registration) => {
    await fetch(`/api/registrations/${reg.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attended: !reg.attended }),
    })
    setRegistrations((rs) => rs.map((r) => r.id === reg.id ? { ...r, attended: !r.attended } : r))
  }

  const deleteReg = async (reg: Registration) => {
    if (!confirm(`Удалить запись ${reg.name}?`)) return
    await fetch(`/api/registrations/${reg.id}`, { method: 'DELETE' })
    setRegistrations((rs) => rs.filter((r) => r.id !== reg.id))
    toast.success('Запись удалена')
  }

  const addPhoto = async () => {
    if (!photoUrl.trim()) return
    const res = await fetch(`/api/events/${id}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: photoUrl.trim() }),
    })
    const data = await res.json()
    setPhotos((ps) => [...ps, data.photo])
    setPhotoUrl('')
    toast.success('Фото добавлено')
  }

  const deletePhoto = async (photo: Photo) => {
    await fetch(`/api/events/${id}/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: photo.id }),
    })
    setPhotos((ps) => ps.filter((p) => p.id !== photo.id))
  }

  const copyRegLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register/${id}`)
    toast.success('Ссылка скопирована')
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /></div>
  if (!event) return <div className="text-slate-500">Мероприятие не найдено</div>

  const attended = registrations.filter((r) => r.attended).length

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/admin/events" className="text-xs text-emerald-600 hover:underline mb-2 inline-block">← Все мероприятия</Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {EVENT_TYPE_LABELS[event.type]}
            </span>
            <span className="text-xs text-slate-400">Этап {event.phase}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{event.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {formatDateRange(event.actual_date_from, event.actual_date_to)}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/admin/events/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Edit2 size={13} /> Редактировать
          </Link>
          <button onClick={deleteEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Записалось', value: registrations.length },
          { label: 'Пришло', value: attended },
          { label: 'Мест всего', value: event.max_participants },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Registration link */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Ссылка на запись</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg truncate">
            {window.location.origin}/register/{id}
          </code>
          <button onClick={copyRegLink}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <Copy size={14} />
          </button>
          <a href={`/register/${id}`} target="_blank"
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Registrations */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Список гостей</h2>
        </div>
        {registrations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Записей пока нет</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Имя</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Телефон</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Возраст</th>
                <th className="text-center px-3 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Пришёл</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className={`border-b border-slate-50 ${reg.attended ? 'bg-emerald-50/40' : ''}`}>
                  <td className="px-5 py-3 font-medium text-slate-800">{reg.name}</td>
                  <td className="px-3 py-3 text-slate-500">{reg.phone}</td>
                  <td className="px-3 py-3 text-slate-500">{reg.age ?? '—'}</td>
                  <td className="px-3 py-3 text-center">
                    <button onClick={() => toggleAttended(reg)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${reg.attended ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-400'}`}>
                      {reg.attended && <Check size={12} />}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => deleteReg(reg)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Фотографии</h2>
        <div className="flex gap-2 mb-4">
          <input type="url" value={photoUrl} placeholder="Ссылка на фото (прямой URL)"
            onChange={(e) => setPhotoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPhoto()}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
          <button onClick={addPhoto}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
            <Plus size={14} /> Добавить
          </button>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img src={photo.url} alt="" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }} />
                <button onClick={() => deletePhoto(photo)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">
          Ссылка на Яндекс Диск: <a href={event.yandex_disk_url} target="_blank" className="text-emerald-600 hover:underline">{event.yandex_disk_url || 'не задана'}</a>
        </p>
      </div>

      {/* Links */}
      {(event.vk_post_url || event.media_links?.length > 0) && (
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Ссылки</h2>
          {event.vk_post_url && (
            <a href={event.vk_post_url} target="_blank"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-2">
              <ExternalLink size={13} /> ВКонтакте
            </a>
          )}
          {event.media_links?.map((url, i) => (
            <a key={i} href={url} target="_blank"
              className="flex items-center gap-2 text-sm text-slate-600 hover:underline mb-1">
              <ExternalLink size={13} /> {url}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
