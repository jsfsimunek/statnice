export default function Navigation({ okruhyCount, activeOkruh, onSelect, titles }) {
  return (
    <nav>
      {/* Opakování – vše dohromady */}
      <button
        onClick={() => onSelect(0)}
        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 mb-4 ${
          activeOkruh === 0
            ? 'bg-brand-600 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        🔄 Opakování – vše
      </button>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Okruhy</p>
      <ul className="space-y-1">
        {Array.from({ length: okruhyCount }, (_, i) => i + 1).map(n => {
          const title = titles?.[n]
          return (
            <li key={n}>
              <button
                onClick={() => onSelect(n)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors duration-150 ${
                  activeOkruh === n
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span className={`text-xs mr-1.5 ${activeOkruh === n ? 'text-brand-200' : 'text-slate-400'}`}>
                  {n}.
                </span>
                {title ? (
                  <span className="line-clamp-2 leading-snug">{title}</span>
                ) : (
                  <span>Okruh {n}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
