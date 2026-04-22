import { useState, useEffect, useCallback } from 'react'

export default function FlashcardsTab({ flashcards }) {
  const cards = flashcards ?? []
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState([])
  const [shuffled, setShuffled] = useState(false)

  const index = order[pos] ?? 0
  const card = cards[index]

  const next = useCallback(() => {
    setFlipped(false)
    setPos(p => (p + 1) % order.length)
  }, [order.length])

  const prev = useCallback(() => {
    setFlipped(false)
    setPos(p => (p - 1 + order.length) % order.length)
  }, [order.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f) }
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (cards.length === 0) {
    return <EmptyState />
  }

  const progress = Math.round((done.length / cards.length) * 100)

  function toggleDone() {
    setDone(d => d.includes(index) ? d.filter(i => i !== index) : [...d, index])
  }

  function toggleShuffle() {
    if (!shuffled) {
      const arr = [...order]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      setOrder(arr)
    } else {
      setOrder(cards.map((_, i) => i))
    }
    setPos(0)
    setFlipped(false)
    setShuffled(s => !s)
  }

  function reset() {
    setOrder(cards.map((_, i) => i))
    setPos(0)
    setFlipped(false)
    setDone([])
    setShuffled(false)
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{pos + 1} / {cards.length}</span>
        <div className="flex items-center gap-3">
          <span>{done.length} zvládnuto</span>
          <button
            onClick={toggleShuffle}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              shuffled ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            🔀 {shuffled ? 'Náhodně' : 'Náhodně'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
        role="button"
        aria-label="Otočit kartičku"
      >
        <div className={`card min-h-52 flex flex-col items-center justify-center text-center gap-3 transition-colors duration-200 ${
          flipped ? 'bg-brand-50 border-brand-200' : 'bg-white'
        } ${done.includes(index) ? 'opacity-60' : ''}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {flipped ? 'Odpověď' : 'Otázka'}
          </span>
          <p className={`text-base sm:text-lg leading-relaxed px-2 ${flipped ? 'text-brand-800' : 'text-slate-800'}`}>
            {flipped ? card.odpoved : card.otazka}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Space / klik · ← →
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={prev}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ← Předchozí
        </button>
        <button
          onClick={toggleDone}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            done.includes(index)
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {done.includes(index) ? '✓ Zvládnuto' : 'Zvládnuto?'}
        </button>
        <button
          onClick={next}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Další →
        </button>
      </div>

      {done.length === cards.length && (
        <div className="card bg-emerald-50 border-emerald-200 text-center py-6">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-emerald-700">Všechny kartičky zvládnuty!</p>
          <button onClick={reset} className="mt-3 text-sm text-emerald-600 underline">Začít znovu</button>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card text-center py-12 text-slate-400">
      <p className="text-3xl mb-3">🃏</p>
      <p className="text-sm">Pro tuto podotázku zatím nejsou žádné flashcards.</p>
    </div>
  )
}
