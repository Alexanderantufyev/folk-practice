import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, MapPin, Users, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useStore } from '../../store/store'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

interface EventPanelProps {
  date: string | null
  onClose: () => void
  onEdit?: (date: string) => void
}

export function EventPanel({ date, onClose, onEdit }: EventPanelProps) {
  const { getEventsForDate } = useStore()
  const [imgIndex, setImgIndex] = useState(0)

  const events = date ? getEventsForDate(date) : []
  const event = events[0] ?? null

  const isFull = event?.maxParticipants != null &&
    event.currentParticipants >= event.maxParticipants

  const spotsLeft = event?.maxParticipants != null
    ? event.maxParticipants - event.currentParticipants
    : null

  const dateLabel = date
    ? format(parseISO(date), 'd MMMM yyyy', { locale: ru })
    : ''

  return (
    <AnimatePresence>
      {date && event && (
        <>
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Image carousel */}
            {event.images.length > 0 && (
              <div className="relative w-full aspect-video bg-stone-100 shrink-0">
                <img
                  src={event.images[imgIndex]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setImgIndex(i => Math.min(event.images.length - 1, i + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {event.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Close & Edit buttons */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors"
                >
                  <X size={16} />
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(date!)}
                    className="absolute top-3 right-12 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pt-4 pb-6">
                {/* No images: show close button in header */}
                {event.images.length === 0 && (
                  <div className="flex justify-between items-start mb-3">
                    <div />
                    <div className="flex gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(date!)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
                          <Pencil size={16} />
                        </button>
                      )}
                      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-pomor-500 font-semibold uppercase tracking-wider mb-1">
                  {dateLabel}
                </p>
                <h3 className="text-xl font-bold text-stone-900 leading-snug mb-3">
                  {event.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {event.time && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Clock size={14} className="text-pomor-400 shrink-0" />
                      <span>{event.time}{event.duration ? ` · ${event.duration}` : ''}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <MapPin size={14} className="text-pomor-400 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.maxParticipants != null && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Users size={14} className="text-pomor-400 shrink-0" />
                      <span>
                        {isFull
                          ? 'Все места заняты'
                          : `Осталось мест: ${spotsLeft}`}
                      </span>
                    </div>
                  )}
                  {event.price != null && (
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                      <span className="text-pomor-500">₽</span>
                      <span>{event.price} руб.</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-stone-600 leading-relaxed mb-5 whitespace-pre-line">
                    {event.description}
                  </p>
                )}

                {/* Register button */}
                {isFull ? (
                  <div className="w-full py-3.5 rounded-2xl bg-stone-100 text-stone-400 text-sm font-semibold text-center">
                    Мест нет
                  </div>
                ) : (
                  <a
                    href={event.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3.5 rounded-2xl bg-pomor-500 hover:bg-pomor-600 active:bg-pomor-700 text-white text-sm font-semibold text-center transition-colors shadow-lg shadow-pomor-500/30"
                  >
                    Записаться на мастер-класс
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
