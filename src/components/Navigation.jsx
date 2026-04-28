export default function Navigation({
  subjects,
  activeSubject,
  onSubjectSelect,
  okruhyCount,
  activeOkruh,
  onSelect,
  titles,
}) {
  return (
    <nav>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Předměty</p>
      <div className="space-y-1 mb-5">
        {subjects.map(subject => (
          <button
            key={subject.slug}
            onClick={() => onSubjectSelect(subject.slug)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
              activeSubject === subject.slug
                ? 'bg-brand-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelect(0)}
        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 mb-4 ${
          activeOkruh === 0
            ? 'bg-brand-600 text-white shadow-sm font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        Opakování - vše
      </button>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">Okruhy</p>
      {okruhyCount > 0 ? (
        <ul className="space-y-1">
          {Array.from({ length: okruhyCount }, (_, index) => index + 1).map(topicNumber => {
            const title = titles?.[topicNumber]
            return (
              <li key={topicNumber}>
                <button
                  onClick={() => onSelect(topicNumber)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors duration-150 ${
                    activeOkruh === topicNumber
                      ? 'bg-brand-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className={`text-xs mr-1.5 ${activeOkruh === topicNumber ? 'text-brand-200' : 'text-slate-400'}`}>
                    {topicNumber}.
                  </span>
                  {title ? (
                    <span className="line-clamp-2 leading-snug">{title}</span>
                  ) : (
                    <span>Okruh {topicNumber}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-xl bg-slate-100 px-3 py-4 text-sm text-slate-500">
          Tenhle předmět zatím čeká na import obsahu.
        </div>
      )}
    </nav>
  )
}
