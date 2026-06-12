import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store/store'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import type { ClassEvent } from '../../types'

interface Props {
  date: string | null
  onClose: () => void
}

function newEvent(date: string): ClassEvent {
  return {
    id: crypto.randomUUID(),
    date,
    title: '',
    description: '',
    time: '',
    duration: '',
    location: '',
    images: [],
    formUrl: '',
    maxParticipants: undefined,
    currentParticipants: 0,
    price: undefined,
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

  const set = (patch: Partial<ClassEvent>) => setForm(f => f ? { ...f, ...patch } : f)

  const addImage = () => {
    if (!newImageUrl.trim()) return
    set({ images: [...form.images, newImageUrl.trim()] })
    setNewImageUrl('')
  }

  const removeImage = (i: number) =>
    set({ images: form.images.filter((_, idx) => idx !== i) })

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Укажите название'); return }
    if (!form.formUrl.trim()) { toast.error('Укажите ссылку на форму'); return }
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

  const dateLabel = format(parseISO(date), 'd MMMM yyyy', { locale: ru })
  const isExisting = getEventsForDate(date).length > 0

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <div>
            <p className="text-[10px] font-semibold text-pomor-500 uppercase tracking-wider">
              {isExisting ? 'Редактировать' : 'Добавить занятие'}
            </p>
            <p className="text-sm font-semibold text-stone-800">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <Field label="Название *">
            <input className={input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Название мастер-класса" />
          </Field>

          <Field label="Описание">
            <textarea className={`${input} resize-none`} rows={4} value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Расскажите о мастер-классе..." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Время">
              <input className={input} value={form.time} onChange={e => set({ time: e.target.value })} placeholder="18:00" />
            </Field>
            <Field label="Длительность">
              <input className={input} value={form.duration ?? ''} onChange={e => set({ duration: e.target.value })} placeholder="2 часа" />
            </Field>
          </div>

          <Field label="Место">
            <input className={input} value={form.location ?? ''} onChange={e => set({ location: e.target.value })} placeholder="Адрес или название места" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Цена (руб)">
              <input className={input} type="number" min="0" value={form.price ?? ''} onChange={e => set({ price: e.target.value ? Number(e.target.value) : undefined })} placeholder="500" />
            </Field>
            <Field label="Макс. мест">
              <input className={input} type="number" min="1" value={form.maxParticipants ?? ''} onChange={e => set({ maxParticipants: e.target.value ? Number(e.target.value) : undefined })} placeholder="5" />
            </Field>
          </div>

          <Field label="Записалось (обновлять вручную)">
            <input className={input} type="number" min="0" value={form.currentParticipants} onChange={e => set({ currentParticipants: Number(e.target.value) })} />
          </Field>

          <Field label="Ссылка на Яндекс-форму *">
            <input className={input} value={form.formUrl} onChange={e => set({ formUrl: e.target.value })} placeholder="https://forms.yandex.ru/..." />
          </Field>

          {/* Images */}
          <Field label="Изображения (ссылки)">
            <div className="space-y-2">
              {form.images.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <img src={url} alt="" className="w-12 h-9 object-cover rounded-lg bg-stone-100 shrink-0" />
                  <span className="flex-1 text-xs text-stone-500 truncate">{url}</span>
                  <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className={`${input} flex-1`}
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addImage()}
                  placeholder="https://..."
                />
                <button onClick={addImage} className="px-3 py-2 rounded-xl bg-pomor-50 hover:bg-pomor-100 text-pomor-600 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100 flex gap-3 shrink-0">
          {isExisting && (
            <button onClick={handleDelete} className="px-4 py-2.5 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
              Удалить
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-2xl bg-pomor-500 hover:bg-pomor-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-pomor-500/25"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
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

const input = 'w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-pomor-400/40 focus:border-pomor-400 transition-all'
