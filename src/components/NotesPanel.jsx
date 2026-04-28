export default function NotesPanel({ value, onChange, loading }) {
  return (
    <section className="card border-l-4 border-amber-400">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="section-heading mb-1">Moje poznamky</h2>
          <p className="text-sm text-slate-500">
            Soukrome poznamky k teto podotazce. V lokalnim rezimu zustanou v tomto prohlizeci, po prihlaseni se ulozi k uctu.
          </p>
        </div>
        {loading && <span className="text-xs text-slate-400">Nacitam...</span>}
      </div>
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        placeholder="Sem si napis vlastni zkratky, chytaky nebo veci, ktere si chces pred statnicemi pripomenout..."
      />
    </section>
  )
}
