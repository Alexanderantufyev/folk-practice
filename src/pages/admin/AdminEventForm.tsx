import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Event, EventType } from '../../types'
import { EVENT_TYPE_LABELS } from '../../types'

const EMPTY: Partial<Event> = {
  title: '', type: 'masterclass', phase: 1, status: 'planned',
  planned_date_from: null, planned_date_to: null,
  actual_date_from: null, actual_date_to: null,
  location: '', max_participants: 20,
  qualitative_result: '', media_publications: 0, media_reach: 0,
  vk_post_url: '', yandex_disk_url: '', media_links: [], comment: '',
}

export function AdminEventForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState<Partial<Event>>(EMPTY)
  const [mediaLink, setMediaLink] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/events/${id}`).then((r) => r.json()).then((d) => {
      if (d.event) setForm(d.event)
    })
  }, [id])

  const set = (field: keyof Event, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }))

  const addMediaLink = () => {
    if (!mediaLink.trim()) return
    set('media_links', [...(form.media_links ?? []), mediaLink.trim()])
    setMediaLink('')
  }

  const removeMediaLink = (i: number) =>
    set('media_links', (form.media_links ?? []).filter((_, idx) => idx !== i))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) { toast.error('Введите название'); return }
    setSaving(true)
    try {
      const res = await fetch(isEdit ? `/api/events/${id}` : '/api/events', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isEdit ? 'Сохранено' : 'Мероприятие создано')
        navigate(`/admin/events/${data.event.id}`)
      } else toast.error('Ошибка сохранения')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link to={isEdit ? `/admin/events/${id}` : '/admin/events'}
          className="text-xs text-emerald-600 hover:underline mb-2 inline-block">← Назад</Link>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Редактировать' : 'Новое мероприятие'}</h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Main info */}
        <Section title="Основное">
          <Field label="Название *">
            <input value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
              placeholder="Название мастер-класса" className="input" required />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Тип">
              <select value={form.type} onChange={(e) => set('type', e.target.value as EventType)} className="input">
                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Этап">
              <select value={form.phase} onChange={(e) => set('phase', Number(e.target.value))} className="input">
                <option value={1}>Этап 1</option>
                <option value={2}>Этап 2</option>
              </select>
            </Field>
            <Field label="Статус">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input">
                <option value="planned">Запланировано</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Локация">
              <input value={form.location ?? ''} onChange={(e) => set('location', e.target.value)}
                placeholder="Адрес или место" className="input" />
            </Field>
            <Field label="Макс. участников">
              <input type="number" value={form.max_participants ?? 20} min={1}
                onChange={(e) => set('max_participants', Number(e.target.value))} className="input" />
            </Field>
          </div>
        </Section>

        {/* Dates */}
        <Section title="Даты">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Плановая дата (от)">
              <input type="date" value={form.planned_date_from ?? ''}
                onChange={(e) => set('planned_date_from', e.target.value || null)} className="input" />
            </Field>
            <Field label="Плановая дата (до)">
              <input type="date" value={form.planned_date_to ?? ''}
                onChange={(e) => set('planned_date_to', e.target.value || null)} className="input" />
            </Field>
            <Field label="Фактическая дата (от)">
              <input type="date" value={form.actual_date_from ?? ''}
                onChange={(e) => set('actual_date_from', e.target.value || null)} className="input" />
            </Field>
            <Field label="Фактическая дата (до)">
              <input type="date" value={form.actual_date_to ?? ''}
                onChange={(e) => set('actual_date_to', e.target.value || null)} className="input" />
            </Field>
          </div>
          <p className="text-xs text-slate-400">Для однодневного события заполните только «от». Для фестиваля — обе даты.</p>
        </Section>

        {/* Report fields */}
        <Section title="Поля для отчёта ПФКИ">
          <Field label="Качественный результат">
            <textarea value={form.qualitative_result ?? ''} rows={4}
              onChange={(e) => set('qualitative_result', e.target.value)}
              placeholder="Описание результата мероприятия для отчёта..."
              className="input resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Публикаций в СМИ">
              <input type="number" value={form.media_publications ?? 0} min={0}
                onChange={(e) => set('media_publications', Number(e.target.value))} className="input" />
            </Field>
            <Field label="Информационный охват">
              <input type="number" value={form.media_reach ?? 0} min={0}
                onChange={(e) => set('media_reach', Number(e.target.value))} className="input" />
            </Field>
          </div>

          <Field label="Комментарий">
            <textarea value={form.comment ?? ''} rows={2}
              onChange={(e) => set('comment', e.target.value)}
              className="input resize-none" />
          </Field>
        </Section>

        {/* Links */}
        <Section title="Ссылки">
          <Field label="Пост ВКонтакте">
            <input type="url" value={form.vk_post_url ?? ''}
              onChange={(e) => set('vk_post_url', e.target.value)}
              placeholder="https://vk.com/..." className="input" />
          </Field>
          <Field label="Яндекс Диск (фото)">
            <input type="url" value={form.yandex_disk_url ?? ''}
              onChange={(e) => set('yandex_disk_url', e.target.value)}
              placeholder="https://disk.yandex.ru/..." className="input" />
          </Field>
          <Field label="Ссылки на СМИ">
            <div className="space-y-2">
              {(form.media_links ?? []).map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg truncate">{url}</span>
                  <button type="button" onClick={() => removeMediaLink(i)}
                    className="text-slate-300 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="url" value={mediaLink} placeholder="https://..."
                  onChange={(e) => setMediaLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMediaLink())}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <button type="button" onClick={addMediaLink}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </Field>
        </Section>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors">
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать мероприятие'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      {children}
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
