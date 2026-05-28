export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${d} ${months[m - 1]} ${y}`
}

export function formatDateFull(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${d} ${months[m - 1]} ${y} г.`
}

export function formatDateRange(from: string | null, to: string | null): string {
  if (!from) return '—'
  if (!to || from.slice(0, 10) === to.slice(0, 10)) return formatDateFull(from)
  return `${formatDateFull(from)} — ${formatDateFull(to)}`
}
