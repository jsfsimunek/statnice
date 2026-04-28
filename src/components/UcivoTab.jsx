import { useState } from 'react'

export default function UcivoTab({ studium, checked: controlledChecked, onCheckedChange }) {
  const sekce = studium?.sekce ?? []
  const checklist = studium?.exam_checklist ?? []
  const [localChecked, setLocalChecked] = useState([])
  const checked = controlledChecked ?? localChecked

  function toggle(index) {
    const next = checked.includes(index)
      ? checked.filter(item => item !== index)
      : [...checked, index]

    if (onCheckedChange) onCheckedChange(next)
    else setLocalChecked(next)
  }

  if (!studium || (sekce.length === 0 && checklist.length === 0)) {
    return <EmptyState />
  }

  return (
    <div className="space-y-5">
      {sekce.map((section, index) => (
        <SekceCard key={index} sekce={section} />
      ))}

      {checklist.length > 0 && (
        <div className="card border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-brand-700">Co musim umet ke zkousce</h3>
            <span className="text-xs text-slate-400">{checked.length}/{checklist.length}</span>
          </div>
          <ul className="space-y-2">
            {checklist.map((item, index) => (
              <ChecklistItem key={index} text={item} done={checked.includes(index)} onToggle={() => toggle(index)} />
            ))}
          </ul>
          {checked.length === checklist.length && (
            <p className="mt-3 text-xs text-emerald-600 font-medium">Vse zvladnuto.</p>
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
          {sekce.seznam.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      )}
      {sekce.obrazky?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {sekce.obrazky.map((image, index) => (
            <figure key={index} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-full">
              <img
                src={image.src}
                alt={image.popis ?? ''}
                className="w-full max-h-72 object-contain"
                loading="lazy"
              />
              {image.popis && (
                <figcaption className="px-3 py-1.5 text-xs text-slate-500 text-center">{image.popis}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {(Array.isArray(sekce.tabulka) ? sekce.tabulka : sekce.tabulka ? [sekce.tabulka] : []).map((table, index) => (
        <Tabulka key={index} tabulka={table} />
      ))}
      {sekce.mnemotechnika && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Mnemotechnika</p>
          <p className="text-sm text-amber-900">{sekce.mnemotechnika}</p>
        </div>
      )}
    </div>
  )
}

function ObsahBlock({ text }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-2 text-slate-700 leading-relaxed text-sm sm:text-base">
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split('\n')
        return (
          <p key={paragraphIndex}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
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
              {sloupce.map((column, index) => (
                <th key={index} className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{column}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {radky.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-slate-700 align-top">{cell}</td>
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
    <li className="flex items-start gap-2.5 text-sm cursor-pointer select-none group" onClick={onToggle}>
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
      <p className="text-sm">Studijni obsah pro tuto podotazku zatim neni k dispozici.</p>
    </div>
  )
}
