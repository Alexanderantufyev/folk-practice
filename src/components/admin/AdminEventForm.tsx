import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store/store'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import type { ClassEvent, Master, Venue } from '../../types'
import { MASTERS, VENUE_LABELS } from '../../types'

interface Props {
  date: string | null
  onClose: () => void
}

function newEvent(date: string): ClassEvent {
  return {
    id: crypto.randomUUID(),
    date,
    master: 'Карлос',
    title: '',
    description: '',
    duration: '',
    forChildren: false,
    maxParticipants: 10,
    venue: 'indoor',
    images: [],
    time: '',
  }
}

export function AdminEventForm({ date, onClose }: Props) {
  const { getEventsForDate, saveEvent, deleteEvent } = useStore()
  const [form, setForm] = useState<ClassEvent | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!date) { setForm(null); return }
    const existing = getEventsForDate(date)[0]
    setForm(existing ?? newEvent(date))
    setNewImageUrl('')
  }, [date])

  if (!date || !form) return null

  const patch = (p: Partial<ClassEvent>) => setForm(f => f ? { ...f, ...p } : f)

  const addImage = () => {
    if (!newImageUrl.trim()) return
    patch({ images: [...form.images, newImageUrl.trim()] })
    setNewImageUrl('')
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Укажите название'); return }
    setSaving(true)
    await saveEvent(form)
    toast.success('Сохранено')
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm('Удалить занятие?')) return
    await deleteEvent(form.id)
    toast.success('Удалено')
    onClose()
  }

  const isExisting = !!getEventsForDate(date)[0]
  const dateLabel = format(parseISO(date), 'd MMMM yyyy', { locale: ru })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
          <button onClick={onClose} className="text-sm text-stone-400 hover:text-stone-700 transition-colors px-1">
            Отменить
          </button>
          <p className="text-xs font-semibold text-stone-500">{dateLabel}</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-semibold text-pomor-600 hover:text-pomor-800 transition-colors disabled:opacity-50 px-1"
          >
            {saving ? '...' : 'Сохранить'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <Field label="Мастер">
            <div className="flex gap-2">
              {MASTERS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => patch({ master: m as Master })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.master === m
                      ? 'bg-pomor-500 text-white border-pomor-500'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-pomor-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Название мастер-класса *">
            <input className={inp} value={form.title} onChange={e => patch({ title: e.target.value })} placeholder="Например: Роспись по дереву" />
          </Field>

          <Field label="Описание">
            <textarea
              className={`${inp} resize-none`}
              rows={4}
              value={form.description}
              onChange={e => patch({ description: e.target.value })}
              placeholder={"Чем будем заниматься\nКакие материалы используем\nНеобходимые навыки\nЧто взять с собой"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Длительность">
              <input className={inp} value={form.duration} onChange={e => patch({ duration: e.target.value })} placeholder="2 часа" />
            </Field>
            <Field label="Время начала">
              <input className={inp} value={form.time ?? ''} onChange={e => patch({ time: e.target.value })} placeholder="18:00" />
            </Field>
          </div>

          <Field label="Где занимаемся">
            <select className={inp} value={form.venue} onChange={e => patch({ venue: e.target.value as Venue })}>
              {(Object.entries(VENUE_LABELS) as [Venue, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="Подходит для детей">
            <div className="flex gap-2">
              {([true, false] as const).map(val => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => patch({ forChildren: val })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.forChildren === val
                      ? 'bg-pomor-500 text-white border-pomor-500'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-pomor-300'
                  }`}
                >
                  {val ? 'Да' : 'Нет'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Макс. участников">
            <input className={inp} type="number" min="1" value={form.maxParticipants} onChange={e => patch({ maxParticipants: Number(e.target.value) })} />
          </Field>

          <Field label="Изображения (ссылки)">
            <div className="space-y-2">
              {form.images.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <img src={url} alt="" className="w-12 h-9 object-cover rounded-lg bg-stone-100 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                  <span className="flex-1 text-xs text-stone-400 truncate">{url}</span>
                  <button onClick={() => patch({ images: form.images.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className={`${inp} flex-1`}
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addImage()}
                  placeholder="https://..."
                />
                <button onClick={addImage} className="px-3 rounded-xl bg-pomor-50 hover:bg-pomor-100 text-pomor-600 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </Field>

          {isExisting && (
            <button onClick={handleDelete} className="w-full py-2.5 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
              Удалить занятие
            </button>
          )}

          <div className="h-8" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inp = 'w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-pomor-400/40 focus:border-pomor-400 transition-all'
