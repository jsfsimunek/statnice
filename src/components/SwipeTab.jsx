import { useEffect, useMemo, useState } from 'react'

export default function SwipeTab({ studium, progressKey, onOpenDetail }) {
  const cards = useMemo(() => createSwipeCards(studium), [studium])
  const storageKey = `swipe-progress:${progressKey}`
  const [status, setStatus] = useState(() => loadSwipeStatus(storageKey))

  useEffect(() => {
    setStatus(loadSwipeStatus(storageKey))
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(status))
  }, [storageKey, status])

  if (cards.length === 0) {
    return <EmptyState />
  }

  const doneCount = status.done.length
  const reviewCount = status.review.length

  function setCardState(index, nextState) {
    setStatus(current => {
      const done = new Set(current.done)
      const review = new Set(current.review)

      if (nextState === 'done') {
        done.add(index)
        review.delete(index)
      } else if (nextState === 'review') {
        review.add(index)
        done.delete(index)
      } else {
        done.delete(index)
        review.delete(index)
      }

      return { done: [...done], review: [...review] }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>{cards.length} rychlých karet</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">{doneCount} umím</span>
          <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">{reviewCount} zopakovat</span>
        </div>
      </div>

      <div className="mx-auto max-w-xl snap-y snap-mandatory overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-2 max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-13rem)]">
        <div className="space-y-2">
          {cards.map((card, index) => {
            const isDone = status.done.includes(index)
            const isReview = status.review.includes(index)

            return (
              <article
                key={`${card.title}-${index}`}
                className={`snap-start rounded-2xl border bg-white p-5 shadow-sm min-h-[68vh] sm:min-h-[560px] flex flex-col ${
                  isDone
                    ? 'border-emerald-200'
                    : isReview
                      ? 'border-amber-200'
                      : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Karta {index + 1} / {cards.length}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-slate-950">
                      {card.title}
                    </h2>
                  </div>
                  <StatusPill isDone={isDone} isReview={isReview} />
                </div>

                {card.lead && (
                  <p className="mt-5 text-base leading-7 text-slate-700">
                    {card.lead}
                  </p>
                )}

                {card.points.length > 0 && (
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
                    {card.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {card.mnemonic && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pomůcka</p>
                    <p className="mt-1 text-sm leading-6 text-amber-950">{card.mnemonic}</p>
                  </div>
                )}

                {card.question && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rychlá kontrola</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{card.question}</p>
                  </div>
                )}

                <div className="mt-auto pt-5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardState(index, isReview ? 'clear' : 'review')}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isReview
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Zopakovat
                  </button>
                  <button
                    type="button"
                    onClick={onOpenDetail}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardState(index, isDone ? 'clear' : 'done')}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Umím
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ isDone, isReview }) {
  if (isDone) {
    return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Umím</span>
  }

  if (isReview) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Zopakovat</span>
  }

  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Nové</span>
}

function EmptyState() {
  return (
    <div className="card text-center py-12 text-slate-400">
      <p className="text-sm">Pro tuto podotázku zatím nejsou připravené swipe karty.</p>
    </div>
  )
}

function createSwipeCards(studium) {
  return (studium?.sekce ?? []).map((section, index) => {
    const points = createPoints(section)
    return {
      title: section.nadpis || `Sekce ${index + 1}`,
      lead: createLead(section.obsah),
      points,
      mnemonic: section.mnemotechnika || '',
      question: points[0] ? `Dokážeš vysvětlit: ${points[0]}?` : '',
    }
  })
}

function createLead(text = '') {
  const cleaned = cleanText(text)
  if (!cleaned) return ''

  const sentence = cleaned
    .split(/(?<=[.!?])\s+/)
    .find(item => item.length > 35) || cleaned

  return shorten(sentence, 210)
}

function createPoints(section) {
  const fromList = (section.seznam ?? [])
    .map(cleanText)
    .filter(Boolean)

  const fromText = String(section.obsah ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^(-|[0-9]+[.)]|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\))\s+/.test(line))
    .map(line => cleanText(line.replace(/^(-|[0-9]+[.)]|[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\))\s+/, '')))

  const fromTable = rowsFrom(section)
    .map(row => row?.filter(Boolean).slice(0, 2).join(': '))
    .map(cleanText)
    .filter(Boolean)

  return unique([...fromList, ...fromText, ...fromTable])
    .map(point => shorten(point, 120))
    .slice(0, 5)
}

function rowsFrom(section) {
  if (Array.isArray(section.tabulka)) {
    return section.tabulka.flatMap(table => table.radky ?? [])
  }

  return section.tabulka?.radky ?? []
}

function cleanText(text) {
  return String(text ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shorten(text, limit) {
  if (text.length <= limit) return text
  return `${text.slice(0, limit - 1).trim()}…`
}

function unique(items) {
  return [...new Set(items)]
}

function loadSwipeStatus(storageKey) {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    return {
      done: Array.isArray(parsed.done) ? parsed.done : [],
      review: Array.isArray(parsed.review) ? parsed.review : [],
    }
  } catch {
    return { done: [], review: [] }
  }
}
