import { useState } from 'react'

export default function UcivoTab({ studium, storageKey }) {
  const sekce = studium?.sekce ?? []
  const checklist = studium?.exam_checklist ?? []
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) ?? '[]') } catch { return [] }
  })

  function toggle(i) {
    setChecked(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  if (!studium || (sekce.length === 0 && checklist.length === 0)) {
    return <EmptyState />
  }

  return (
    <div className="space-y-5">
      {sekce.map((s, idx) => (
        <SekceCard key={idx} sekce={s} />
      ))}

      {checklist.length > 0 && (
        <div className="card border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-brand-700 flex items-center gap-2">
              <span>✅</span> Co musím umět ke zkoušce
            </h3>
            <span className="text-xs text-slate-400">{checked.length}/{checklist.length}</span>
          </div>
          <ul className="space-y-2">
            {checklist.map((item, i) => (
              <ChecklistItem key={i} text={item} done={checked.includes(i)} onToggle={() => toggle(i)} />
            ))}
          </ul>
          {checked.length === checklist.length && (
            <p className="mt-3 text-xs text-emerald-600 font-medium">Vše zvládnuto! 🎉</p>
          )}
        </div>
      )}
    </div>
  )
}

function SekceCard({ sekce }) {
  return (
    <div className="card space-y-3">
      {sekce.nadpis && <h2 className="section-heading">{sekce.nadpis}</h2>}
      {sekce.obsah && <ObsahBlock text={sekce.obsah} />}
      {sekce.seznam?.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 pl-1">
          {sekce.seznam.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
      {(Array.isArray(sekce.tabulka) ? sekce.tabulka : sekce.tabulka ? [sekce.tabulka] : []).map((t, ti) => <Tabulka key={ti} tabulka={t} />)}
      {sekce.mnemotechnika && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-start">
          <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-0.5">Mnemotechnika</p>
            <p className="text-sm text-amber-900">{sekce.mnemotechnika}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ObsahBlock({ text }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-2 text-slate-700 leading-relaxed text-sm sm:text-base">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n')
        return (
          <p key={pi}>
            {lines.map((line, li) => (
              <span key={li}>
                {line}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function Tabulka({ tabulka }) {
  const sloupce = tabulka.sloupce ?? []
  const radky = tabulka.radky ?? []
  if (sloupce.length === 0 && radky.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        {sloupce.length > 0 && (
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {sloupce.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {radky.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-700 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChecklistItem({ text, done, onToggle }) {
  return (
    <li
      className="flex items-start gap-2.5 text-sm cursor-pointer select-none group"
      onClick={onToggle}
    >
      <span className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
        done ? 'bg-brand-600 border-brand-600' : 'border-brand-300 group-hover:border-brand-500'
      }`}>
        {done && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      <span className={done ? 'text-slate-400 line-through' : 'text-slate-700'}>{text}</span>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-12 text-slate-400">
      <p className="text-3xl mb-3">📝</p>
      <p className="text-sm">Studijní obsah pro tuto podotázku zatím není k dispozici.</p>
    </div>
  )
}
