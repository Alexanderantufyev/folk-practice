import { useState } from 'react'
import { useStore } from '../../store/store'
import toast from 'react-hot-toast'

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const { tryAdminLogin } = useStore()
  const [key, setKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tryAdminLogin(key)) {
      toast.success('Режим редактирования включён')
      onClose()
    } else {
      toast.error('Неверный ключ')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl"
      >
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Вход для редактора</h3>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Ключ доступа"
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-pomor-400/40 focus:border-pomor-400 mb-3"
        />
        <button type="submit" className="w-full py-2.5 rounded-xl bg-pomor-500 text-white text-sm font-semibold hover:bg-pomor-600 transition-colors">
          Войти
        </button>
      </form>
    </div>
  )
}
