import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer } from 'lucide-react'
import type { Event, Photo } from '../../types'
import { EVENT_TYPE_LABELS } from '../../types'
import { formatDateRange } from '../../utils/format'

interface EventWithPhotos extends Event {
  photos: Photo[]
}

export function AdminReport() {
  const { phase } = useParams<{ phase: string }>()
  const [events, setEvents] = useState<EventWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/events?admin=1&phase=${phase}`)
      .then((r) => r.json())
      .then(async (d) => {
        const evs: Event[] = d.events ?? []
        const withPhotos = await Promise.all(
          evs.map(async (e) => {
            const res = await fetch(`/api/events/${e.id}`)
            const data = await res.json()
            return { ...e, photos: data.photos ?? [] }
          })
        )
        setEvents(withPhotos)
      })
      .finally(() => setLoading(false))
  }, [phase])

  const print = () => window.print()

  const totalParticipants = events.reduce((s, e) => s + (e.attended_count ?? e.registrations_count ?? 0), 0)
  const totalPublications = events.reduce((s, e) => s + (e.media_publications ?? 0), 0)
  const totalReach = events.reduce((s, e) => s + (e.media_reach ?? 0), 0)

  if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" /></div>

  return (
    <div>
      {/* Print controls - hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/events" className="text-xs text-emerald-600 hover:underline mb-1 inline-block">← Мероприятия</Link>
          <h1 className="text-xl font-bold text-slate-900">Отчёт ПФКИ — Этап {phase}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{events.length} мероприятий · {totalParticipants} участников</p>
        </div>
        <button onClick={print}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
          <Printer size={15} /> Печать / PDF
        </button>
      </div>

      {/* Report content */}
      <div ref={printRef} className="bg-white print:shadow-none shadow-sm border border-slate-100 print:border-0 rounded-xl print:rounded-none p-8 print:p-0 max-w-4xl">

        {/* Section 2 — Events */}
        <div className="space-y-0">
          {events.map((event, idx) => {
            const isLastEvent = idx === events.length - 1
            const attended = event.attended_count ?? event.registrations_count ?? 0
            const participantLabel = event.type === 'festival'
              ? 'Количество гостей фестиваля'
              : 'Количество участников мероприятия'

            return (
              <div key={event.id} className={`mb-0 ${!isLastEvent ? 'page-break-inside-avoid' : ''}`}
                style={{ pageBreakInside: 'avoid' }}>

                {/* 2.x.1 Event header */}
                <table className="w-full border-collapse text-sm mb-0" style={{ borderTop: idx === 0 ? '1px solid #000' : undefined }}>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 w-8 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-2 font-semibold" colSpan={3}>
                        {EVENT_TYPE_LABELS[event.type]}: {event.title}
                        {event.location ? `. Место проведения: ${event.location}.` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2 text-center text-xs text-gray-500">ККТ</td>
                      <td className="border border-black p-2 text-xs">
                        <strong>Плановые сроки:</strong> {formatDateRange(event.planned_date_from, event.planned_date_to)}
                      </td>
                      <td className="border border-black p-2 text-xs">
                        <strong>Фактические сроки:</strong> {formatDateRange(event.actual_date_from, event.actual_date_to)}
                      </td>
                      <td className="border border-black p-2 text-xs">
                        <strong>Итог:</strong> {event.status === 'completed' ? 'исполнено' : event.status === 'cancelled' ? 'отменено' : 'в работе'}
                      </td>
                    </tr>

                    {/* Qualitative result */}
                    <tr>
                      <td className="border border-black p-2 text-xs text-gray-500 text-center">2.{idx + 1}.5</td>
                      <td className="border border-black p-2 text-xs" colSpan={3}>
                        <strong>Качественный результат:</strong> {event.qualitative_result || '—'}
                      </td>
                    </tr>

                    {/* Quantitative result */}
                    <tr>
                      <td className="border border-black p-2 text-xs text-gray-500 text-center">2.{idx + 1}.6</td>
                      <td className="border border-black p-2 text-xs" colSpan={3}>
                        <strong>Количественный результат:</strong>
                        <table className="mt-1 w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-gray-400 p-1 text-left text-xs font-medium bg-gray-50">Наименование показателя</th>
                              <th className="border border-gray-400 p-1 text-center text-xs font-medium bg-gray-50 w-20">Значение</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 p-1 text-xs">{participantLabel}</td>
                              <td className="border border-gray-400 p-1 text-xs text-center">{attended}</td>
                            </tr>
                            {event.media_publications > 0 && (
                              <tr>
                                <td className="border border-gray-400 p-1 text-xs">Количество публикаций в СМИ</td>
                                <td className="border border-gray-400 p-1 text-xs text-center">{event.media_publications}</td>
                              </tr>
                            )}
                            {event.media_reach > 0 && (
                              <tr>
                                <td className="border border-gray-400 p-1 text-xs">Информационный охват аудитории</td>
                                <td className="border border-gray-400 p-1 text-xs text-center">{event.media_reach.toLocaleString('ru-RU')}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 2.x.7 Photos */}
                {event.photos.length > 0 && (
                  <div className="border border-black border-t-0 p-3">
                    <p className="text-xs text-gray-500 mb-2">2.{idx + 1}.7. Фотографии проведённого мероприятия</p>
                    <div className="grid grid-cols-2 gap-3">
                      {event.photos.map((photo, pi) => (
                        <div key={photo.id} className="text-center">
                          <img src={photo.url} alt=""
                            className="w-full object-cover rounded"
                            style={{ maxHeight: '200px' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <p className="text-[10px] text-gray-500 mt-1">
                            {event.title} {pi + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2.x.8 Media links */}
                {(event.vk_post_url || (event.media_links?.length ?? 0) > 0) && (
                  <div className="border border-black border-t-0 p-2 text-xs">
                    <p className="text-gray-500 mb-1">2.{idx + 1}.8. Электронные ссылки на публикации</p>
                    {event.vk_post_url && <p className="break-all">{event.vk_post_url}</p>}
                    {event.media_links?.map((url, i) => <p key={i} className="break-all">{url}</p>)}
                  </div>
                )}

                {/* 2.x.9 Cloud links */}
                {event.yandex_disk_url && (
                  <div className="border border-black border-t-0 p-2 text-xs">
                    <p className="text-gray-500 mb-1">2.{idx + 1}.9. Ссылки на облачные хранилища</p>
                    <p className="break-all">{event.yandex_disk_url}</p>
                  </div>
                )}

                {/* 2.x.11 Comment */}
                {event.comment && (
                  <div className="border border-black border-t-0 p-2 text-xs">
                    <p className="text-gray-500 mb-1">2.{idx + 1}.11. Дополнительный комментарий</p>
                    <p>{event.comment}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Section 3 — Summary */}
        <div className="mt-8 pt-8 border-t-2 border-black">
          <h2 className="text-base font-bold mb-4">Раздел 3. Общая информация по этапу {phase}</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-left">Показатель</th>
                <th className="border border-black p-2 text-center w-32">Значение</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">Количество проведённых мероприятий</td>
                <td className="border border-black p-2 text-center font-bold">{events.filter(e => e.status === 'completed').length}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Общее количество участников</td>
                <td className="border border-black p-2 text-center font-bold">{totalParticipants}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Количество публикаций в СМИ</td>
                <td className="border border-black p-2 text-center font-bold">{totalPublications}</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Информационный охват аудитории</td>
                <td className="border border-black p-2 text-center font-bold">{totalReach.toLocaleString('ru-RU')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          #root { padding: 0; }
          [ref] { visibility: visible; }
        }
      `}</style>
    </div>
  )
}
