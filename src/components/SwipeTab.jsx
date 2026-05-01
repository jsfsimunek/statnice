import { useEffect, useMemo, useState } from 'react'

const LETTER_PATTERN = 'A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ'

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
  const progress = Math.round((doneCount / cards.length) * 100)

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
    <section className="relative -mx-4 sm:mx-0">
      <div className="sticky top-16 z-20 border-y border-slate-200 bg-white/95 px-4 py-2 backdrop-blur sm:top-20 sm:rounded-2xl sm:border">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenDetail}
            className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
          >
            Zavřít swipe
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-xs font-semibold text-slate-700">
              {doneCount} umím · {reviewCount} zopakovat · {cards.length} karet
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl snap-y snap-mandatory overflow-y-auto bg-slate-100 px-3 py-3 [scrollbar-width:none] sm:mt-3 sm:rounded-3xl sm:border sm:border-slate-200 sm:p-3 sm:max-h-[calc(100vh-12rem)] max-h-[calc(100dvh-8.5rem)]">
        <div className="space-y-3">
          {cards.map((card, index) => {
            const isDone = status.done.includes(index)
            const isReview = status.review.includes(index)

            return (
              <article
                key={`${card.title}-${index}`}
                className={`snap-start rounded-2xl border bg-white p-4 shadow-sm min-h-[calc(100dvh-10rem)] sm:min-h-[520px] flex flex-col ${
                  isDone
                    ? 'border-emerald-200'
                    : isReview
                      ? 'border-amber-200'
                      : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-500">
                      Karta {index + 1} / {cards.length}
                    </p>
                    <h2 className="mt-1 font-serif text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
                      {card.title}
                    </h2>
                  </div>
                  <StatusPill isDone={isDone} isReview={isReview} />
                </div>

                {card.lead && (
                  <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
                    {card.lead}
                  </p>
                )}

                {card.points.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm leading-5 text-slate-700 sm:leading-6">
                    {card.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {card.mnemonic && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Pomůcka</p>
                    <p className="mt-1 text-sm leading-5 text-amber-950">{card.mnemonic}</p>
                  </div>
                )}

                {card.question && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Kontrola</p>
                    <p className="mt-1 text-sm leading-5 text-slate-700">{card.question}</p>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCardState(index, isReview ? 'clear' : 'review')}
                      className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
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
                      className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardState(index, isDone ? 'clear' : 'done')}
                      className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Umím
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatusPill({ isDone, isReview }) {
  if (isDone) {
    return <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Umím</span>
  }

  if (isReview) {
    return <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">Zopakovat</span>
  }

  return <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">Nové</span>
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
      question: points[0] ? `Vysvětli vlastními slovy: ${points[0]}.` : '',
    }
  })
}

function createLead(text = '') {
  const cleaned = cleanText(text)
  if (!cleaned) return ''

  const sentence = cleaned
    .split(/(?<=[.!?])\s+/)
    .find(item => item.length > 35) || cleaned

  return shorten(sentence, 180)
}

function createPoints(section) {
  const fromList = (section.seznam ?? [])
    .map(cleanText)
    .filter(Boolean)

  const listLinePattern = new RegExp(`^(-|[0-9]+[.)]|[${LETTER_PATTERN}]\\))\\s+`)
  const fromText = String(section.obsah ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => listLinePattern.test(line))
    .map(line => cleanText(line.replace(listLinePattern, '')))

  const fromTable = rowsFrom(section)
    .map(row => row?.filter(Boolean).slice(0, 2).join(': '))
    .map(cleanText)
    .filter(Boolean)

  return unique([...fromList, ...fromText, ...fromTable])
    .map(point => shorten(point, 105))
    .slice(0, 4)
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
