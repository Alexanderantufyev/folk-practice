import { useState, useEffect } from 'react'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => setStatus(d.ok ? 'authenticated' : 'unauthenticated'))
      .catch(() => setStatus('unauthenticated'))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) setStatus('authenticated')
      else { setError('Неверный пароль'); setPassword('') }
    } catch { setError('Нет связи с сервером') }
    finally { setSubmitting(false) }
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
    </div>
  )

  if (status === 'unauthenticated') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="text-xl font-bold text-slate-900">Поморцы</h1>
          <p className="text-sm text-slate-500 mt-1">Фольклорные практики в городе</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Пароль</label>
            <input
              type="password" value={password} autoFocus placeholder="••••"
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>
          <button type="submit" disabled={submitting || !password}
            className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors">
            {submitting ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )

  return <>{children}</>
}
