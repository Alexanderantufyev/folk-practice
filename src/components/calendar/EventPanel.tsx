import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MapPin, Users, ChevronLeft, ChevronRight, Baby } from 'lucide-react'
import { useStore } from '../../store/store'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { VENUE_LABELS } from '../../types'

interface EventPanelProps {
  date: string | null
  onClose: () => void
}

export function EventPanel({ date, onClose }: EventPanelProps) {
  const { getEventsForDate } = useStore()
  const [imgIndex, setImgIndex] = useState(0)

  const events = date ? getEventsForDate(date) : []
  const event = events[0] ?? null
  const dateLabel = date ? format(parseISO(date), 'd MMMM yyyy', { locale: ru }) : ''

  return (
    <AnimatePresence>
      {date && event && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {event.images.length > 0 && (
              <div className="relative w-full aspect-video bg-stone-100 shrink-0">
                <img src={event.images[imgIndex]} alt={event.title} className="w-full h-full object-cover" />
                {event.images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setImgIndex(i => Math.min(event.images.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5">
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {event.images.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)} className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
                <button onClick={onClose} className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pt-4 pb-8">
                {event.images.length === 0 && (
                  <div className="flex justify-end mb-3">
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-pomor-500 font-semibold uppercase tracking-wider mb-1">{dateLabel}</p>
                <span className="inline-block text-xs font-medium text-pomor-600 bg-pomor-50 px-2.5 py-1 rounded-full mb-2">
                  Мастер: {event.master}
                </span>
                <h3 className="text-xl font-bold text-stone-900 leading-snug mb-4">{event.title}</h3>

                <div className="flex flex-col gap-2 mb-4">
                  {(event.time || event.duration) && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Clock size={14} className="text-pomor-400 shrink-0" />
                      <span>{[event.time, event.duration].filter(Boolean).join(' · ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <MapPin size={14} className="text-pomor-400 shrink-0" />
                    <span>{VENUE_LABELS[event.venue]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Users size={14} className="text-pomor-400 shrink-0" />
                    <span>Мест: {event.maxParticipants}</span>
                  </div>
                  {event.forChildren && (
                    <div className="flex items-center gap-2 text-sm text-pomor-600">
                      <Baby size={14} className="shrink-0" />
                      <span>Подходит для детей</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
