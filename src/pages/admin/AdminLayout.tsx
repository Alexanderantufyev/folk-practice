import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, FileText, LogOut } from 'lucide-react'

export function AdminLayout() {
  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="text-xl mb-0.5">🌿</div>
          <p className="text-sm font-semibold text-slate-800">Поморцы</p>
          <p className="text-xs text-slate-400">Фольклорные практики</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/events"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar size={15} /> Мероприятия
          </NavLink>

          <div className="pt-2 pb-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">Отчёты</p>
            <NavLink to="/admin/report/1"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <FileText size={15} /> Этап 1
            </NavLink>
            <NavLink to="/admin/report/2"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <FileText size={15} /> Этап 2
            </NavLink>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button onClick={logout}
            className="flex items-center gap-2 px-3 py-2 w-full text-sm text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <LogOut size={14} /> Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  )
}
