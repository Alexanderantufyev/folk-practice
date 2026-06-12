import { useStore } from '../../store/store'

export function Header() {
  const { isAdmin, adminLogout } = useStore()

  return (
    <header className="bg-pomor-700 text-white">
      <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
        {/* Ёлочка SVG */}
        <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <polygon points="22,2 38,18 30,18 42,32 32,32 40,44 4,44 12,32 2,32 14,18 6,18" fill="#a5d9d2" opacity="0.9"/>
          <rect x="18" y="44" width="8" height="7" rx="1" fill="#6dbfb5"/>
          <circle cx="22" cy="12" r="2" fill="white" opacity="0.8"/>
          <circle cx="14" cy="24" r="1.5" fill="white" opacity="0.7"/>
          <circle cx="30" cy="22" r="1.5" fill="white" opacity="0.7"/>
          <circle cx="10" cy="36" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="34" cy="36" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="22" cy="30" r="2" fill="white" opacity="0.8"/>
        </svg>

        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight tracking-wide">
            Ладом да Берегом
          </h1>
          <p className="text-pomor-200 text-xs mt-0.5 leading-snug">
            Фольклорные практики в городе
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={adminLogout}
            className="text-xs text-pomor-200 hover:text-white transition-colors px-2 py-1 rounded border border-pomor-500 hover:border-pomor-300"
          >
            Выйти
          </button>
        )}
      </div>
    </header>
  )
}
