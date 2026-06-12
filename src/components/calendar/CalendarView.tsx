import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useStore } from '../../store/store'
import { DayPanel } from './DayPanel'
import { AdminEventForm } from '../admin/AdminEventForm'
import type { ClassEvent } from '../../types'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function CalendarView() {
  const { currentMonth, setCurrentMonth, getEventsForDate } = useStore()
  const [viewingDate, setViewingDate] = useState<string | null>(null)
  const [editState, setEditState] = useState<{ date: string; event?: ClassEvent } | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const handleDayClick = (dateStr: string) => {
    const evts = getEventsForDate(dateStr)
    if (evts.length === 0) {
      setEditState({ date: dateStr })
    } else {
      setViewingDate(dateStr)
    }
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
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => inMonth && handleDayClick(dateStr)}
              className={[
                'group relative aspect-square rounded-xl flex flex-col items-center overflow-hidden transition-all font-medium',
                hasEvent ? 'justify-start pt-1.5' : 'justify-center text-sm',
                !inMonth && 'opacity-20 cursor-default',
                inMonth && !hasEvent && 'hover:bg-pomor-50 hover:text-pomor-600 text-stone-500 cursor-pointer',
                inMonth && hasEvent && 'bg-pomor-500 text-white hover:bg-pomor-600 shadow-sm cursor-pointer',
                today && !hasEvent && 'ring-2 ring-pomor-300 ring-offset-1',
              ].filter(Boolean).join(' ')}
            >
              <span className={hasEvent ? 'text-xs leading-none' : ''}>{format(day, 'd')}</span>
              {hasEvent && (
                <span className="text-[9px] font-normal leading-tight px-0.5 w-full text-center truncate mt-0.5 opacity-90">
                  {events.length === 1 ? (events[0].title || events[0].master) : `${events.length} зан.`}
                </span>
              )}
              {events.length > 1 && (
                <span className="absolute top-0.5 right-0.5 text-[8px] font-bold bg-white/25 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {events.length}
                </span>
              )}
              {inMonth && !hasEvent && (
                <Plus size={10} className="absolute bottom-0.5 right-0.5 opacity-0 group-hover:opacity-50 text-pomor-400 transition-opacity" />
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
      </div>

      <p className="text-center text-xs text-pomor-400 mt-3">
        Нажмите на дату чтобы добавить или изменить занятие
      </p>

      <DayPanel
        date={viewingDate}
        onClose={() => setViewingDate(null)}
        onEdit={(event) => { setViewingDate(null); setEditState({ date: event.date, event }) }}
        onAdd={() => { setEditState({ date: viewingDate! }); setViewingDate(null) }}
      />
      <AdminEventForm
        open={!!editState}
        date={editState?.date ?? ''}
        event={editState?.event}
        onClose={() => setEditState(null)}
      />
    </div>
  )
}
