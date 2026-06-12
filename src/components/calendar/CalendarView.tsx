import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useStore } from '../../store/store'
import { EventPanel } from './EventPanel'
import { AdminEventForm } from '../admin/AdminEventForm'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function CalendarView() {
  const { currentMonth, setCurrentMonth, getEventsForDate } = useStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const handleDayClick = (dateStr: string) => {
    setEditingDate(dateStr)
  }

  const monthLabel = format(currentMonth, 'LLLL yyyy', { locale: ru })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-pomor-50 text-pomor-600 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-stone-800 capitalize">{monthLabel}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-pomor-50 text-pomor-600 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const events = getEventsForDate(dateStr)
          const hasEvent = events.length > 0
          const isFull = hasEvent && events[0].maxParticipants != null &&
            (events[0] as any).currentParticipants >= events[0].maxParticipants
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => inMonth && handleDayClick(dateStr)}
              className={[
                'group relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all text-sm font-medium',
                !inMonth && 'opacity-20 cursor-default',
                inMonth && !hasEvent && 'hover:bg-pomor-50 hover:text-pomor-600 text-stone-500 cursor-pointer',
                inMonth && hasEvent && !isFull && 'bg-pomor-500 text-white hover:bg-pomor-600 shadow-sm cursor-pointer',
                inMonth && hasEvent && isFull && 'bg-stone-200 text-stone-400 cursor-pointer',
                today && !hasEvent && 'ring-2 ring-pomor-300 ring-offset-1',
              ].filter(Boolean).join(' ')}
            >
              {format(day, 'd')}
              {hasEvent && !isFull && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-70" />
              )}
              {inMonth && !hasEvent && (
                <Plus size={12} className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-50 text-pomor-400 transition-opacity" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-stone-400 justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-pomor-500 inline-block" />
          Есть занятие
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-stone-200 inline-block" />
          Мест нет
        </span>
      </div>

      <p className="text-center text-xs text-pomor-400 mt-3">
        Нажмите на дату чтобы добавить или изменить занятие
      </p>

      <EventPanel
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
      <AdminEventForm
        date={editingDate}
        onClose={() => setEditingDate(null)}
      />
    </div>
  )
}
