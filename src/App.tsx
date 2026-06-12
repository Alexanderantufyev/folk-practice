import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Header } from './components/layout/Header'
import { CalendarView } from './components/calendar/CalendarView'
import { useStore, isRedisConfigured } from './store/store'

export default function App() {
  const { loadEvents, isLoading } = useStore()

  useEffect(() => { loadEvents() }, [loadEvents])

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {!isRedisConfigured && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
            ⚠️ Redis не настроен — изменения не сохраняются. Проверьте переменные окружения в Vercel.
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-pomor-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <CalendarView />
      )}

      <footer className="text-center py-6 mt-4">
        <p className="text-xs text-stone-300">Ладом да Берегом © 2025</p>
      </footer>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '13px', fontWeight: 500 },
          success: { iconTheme: { primary: '#1B6255', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
