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
        <SekceCard key={index} sekce={section} index={index} />
      ))}

      {checklist.length > 0 && (
        <div className="card border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-brand-700">Co musím umět ke zkoušce</h3>
            <span className="text-xs text-slate-400">{checked.length}/{checklist.length}</span>
          </div>
          <ul className="space-y-2">
            {checklist.map((item, index) => (
              <ChecklistItem key={index} text={item} done={checked.includes(index)} onToggle={() => toggle(index)} />
            ))}
          </ul>
          {checked.length === checklist.length && (
            <p className="mt-3 text-xs text-emerald-600 font-medium">Vše zvládnuto.</p>
          )}
        </div>
      )}
    </div>
  )
}

function SekceCard({ sekce, index }) {
  const tables = Array.isArray(sekce.tabulka) ? sekce.tabulka : sekce.tabulka ? [sekce.tabulka] : []
  const mnemonic = sekce.mnemotechnika || createMnemonic(sekce, index)

  return (
    <article className="card space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
          {index + 1}
        </span>
        <div className="min-w-0">
          {sekce.nadpis && <h2 className="section-heading mb-1">{sekce.nadpis}</h2>}
          {sekce.obsah && <LeadSentence text={sekce.obsah} />}
        </div>
      </div>

      {sekce.obsah && <ObsahBlock text={sekce.obsah} />}

      {sekce.seznam?.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {sekce.seznam.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
        </ul>
      )}

      {sekce.obrazky?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {sekce.obrazky.map((image, imageIndex) => (
            <figure key={imageIndex} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-full">
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

      {tables.map((table, tableIndex) => (
        <Tabulka key={tableIndex} tabulka={table} />
      ))}

      {mnemonic && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">
            {sekce.mnemotechnika ? 'Mnemotechnika' : 'Pomůcka k zapamatování'}
          </p>
          <p className="text-sm text-amber-900">{mnemonic}</p>
        </div>
      )}
    </article>
  )
}

function LeadSentence({ text }) {
  const sentence = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .find(item => item.length > 35)

  if (!sentence) return null

  return (
    <p className="text-sm leading-6 text-slate-500">
      {sentence.length > 220 ? `${sentence.slice(0, 220).trim()}...` : sentence}
    </p>
  )
}

function ObsahBlock({ text }) {
  const blocks = text.split(/\n\n+/).map(item => item.trim()).filter(Boolean)
  return (
    <div className="space-y-3 text-slate-700 leading-relaxed text-sm sm:text-base">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
        const introLine = lines.length > 1 && /[:：]$/.test(lines[0]) ? lines[0] : null
        const listLines = introLine ? lines.slice(1) : lines
        const isList = listLines.length > 1 && listLines.every(isListLine)

        if (isList) {
          return (
            <div key={blockIndex} className="space-y-1.5">
              {introLine && <p className="font-medium text-slate-800">{introLine}</p>}
              <ul className="list-disc space-y-1 pl-5">
                {listLines.map((line, lineIndex) => (
                  <li key={lineIndex}>
                    <InlineEmphasis text={cleanListMarker(line)} />
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                <InlineEmphasis text={line} />
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function InlineEmphasis({ text }) {
  const match = text.match(/^([^:]{2,48}):\s+(.+)$/)
  if (!match) return text

  return (
    <>
      <strong className="font-semibold text-slate-800">{match[1]}:</strong> {match[2]}
    </>
  )
}

function isListLine(line) {
  return /^(-|[0-9]+[.)]|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\))\s+/.test(line)
}

function cleanListMarker(line) {
  return line.replace(/^-\s+/, '').replace(/^([0-9]+[.)]|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\))\s+/, '$1 ')
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
      <p className="text-sm">Studijní obsah pro tuto podotázku zatím není k dispozici.</p>
    </div>
  )
}

function createMnemonic(sekce, index) {
  const rows = Array.isArray(sekce.tabulka)
    ? sekce.tabulka.flatMap(table => table.radky ?? [])
    : sekce.tabulka?.radky ?? []

  const terms = rows
    .map(row => row?.[0])
    .filter(item => typeof item === 'string' && item.length > 1 && item.length < 42)
    .slice(0, 5)

  if (terms.length >= 3) {
    const initials = terms.map(term => term.trim()[0]?.toUpperCase()).join('-')
    return `${initials}: ${terms.join(', ')}.`
  }

  if (Array.isArray(sekce.seznam) && sekce.seznam.length >= 3) {
    const listTerms = sekce.seznam
      .map(item => item.split(/[–:-]/)[0].trim())
      .filter(Boolean)
      .slice(0, 5)
    const initials = listTerms.map(term => term[0]?.toUpperCase()).join('-')
    return `${initials}: ${listTerms.join(', ')}.`
  }

  if (sekce.nadpis) {
    return `Sekce ${index + 1}: zapamatuj si ji přes klíčové slovo „${sekce.nadpis.replace(/^\d+\.\s*/, '')}“.`
  }

  return ''
}
