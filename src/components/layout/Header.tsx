export function Header() {
  return (
    <header className="bg-white border-b border-stone-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Логотип Поморцев"
          className="w-12 h-12 shrink-0 object-contain"
        />

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-pomor-700 leading-tight">
            Ладом да Берегом
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Фольклорные практики в городе
          </p>
        </div>

        <p className="hidden sm:block text-xs text-stone-500 text-right max-w-[160px] leading-snug shrink-0">
          Внутренняя форма для мастеров
        </p>
      </div>

      <p className="sm:hidden text-center text-xs text-stone-400 pb-2 px-4">
        Внутренняя форма для мастеров
      </p>
    </header>
  )
}
