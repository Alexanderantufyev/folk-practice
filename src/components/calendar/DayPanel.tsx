import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Plus, X } from 'lucide-react'
import { useStore } from '../../store/store'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { ClassEvent } from '../../types'
import { VENUE_LABELS } from '../../types'

interface Props {
  date: string | null
  onClose: () => void
  onEdit: (event: ClassEvent) => void
  onAdd: () => void
}

export function DayPanel({ date, onClose, onEdit, onAdd }: Props) {
  const { getEventsForDate } = useStore()
  const events = date ? getEventsForDate(date) : []
  const dateLabel = date ? format(parseISO(date), 'd MMMM yyyy', { locale: ru }) : ''

  return (
    <AnimatePresence>
      {date && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
                <X size={18} />
              </button>
              <p className="text-xs font-semibold text-stone-500 capitalize">{dateLabel}</p>
              <button
                onClick={onAdd}
                className="flex items-center gap-1 text-sm font-semibold text-pomor-600 hover:text-pomor-800 transition-colors px-1"
              >
                <Plus size={15} />
                Добавить
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => onEdit(event)}
                  className="w-full text-left p-4 rounded-2xl border border-stone-100 bg-stone-50 hover:border-pomor-200 hover:bg-pomor-50 active:bg-pomor-100 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[11px] font-semibold text-pomor-600 bg-pomor-50 border border-pomor-100 px-2 py-0.5 rounded-full mb-2">
                        {event.master}
                      </span>
                      <p className="text-sm font-semibold text-stone-800 leading-snug">{event.title || '(без названия)'}</p>
                      {(event.time || event.duration) && (
                        <p className="text-xs text-stone-400 mt-1">{[event.time, event.duration].filter(Boolean).join(' · ')}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-0.5">{VENUE_LABELS[event.venue]}</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
