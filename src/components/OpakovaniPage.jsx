import { useState, useEffect, useCallback } from 'react'

const OKRUHY_COUNT = 10
const TABS = [
  { id: 'flashcards', label: '🃏 Flashcards' },
  { id: 'kviz', label: '✏️ Kvíz' },
]

export default function OpakovaniPage() {
  const [activeTab, setActiveTab] = useState('flashcards')
  const [cards, setCards] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    const base = import.meta.env.BASE_URL
    const promises = Array.from({ length: OKRUHY_COUNT }, (_, i) => i + 1).map(n =>
      fetch(`${base}data/okruh${n}.json`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )

    Promise.all(promises).then(results => {
      const allCards = []
      const allQuestions = []
      let count = 0

      results.forEach(data => {
        if (!data) return
        count++
        const okruhLabel = `Okruh ${data.id}`

        ;(data.podotazky ?? []).forEach(p => {
          const label = `${okruhLabel} · ${p.pismeno}`
          ;(p.flashcards ?? []).forEach(fc => {
            allCards.push({ ...fc, label })
          })
          ;(p.kviz ?? []).forEach(q => {
            allQuestions.push({ ...q, label })
          })
        })
      })

      setCards(allCards)
      setQuestions(allQuestions)
      setLoadedCount(count)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm text-slate-400">Načítám okruhy…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Opakování</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
          Vše dohromady
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {loadedCount} okruhů · {cards.length} flashcards · {questions.length} otázek
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 bg-slate-100 rounded-full w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'flashcards' && <AllFlashcards cards={cards} />}
      {activeTab === 'kviz' && <AllKviz questions={questions} />}
    </div>
  )
}

function AllFlashcards({ cards }) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState([])
  const [shuffled, setShuffled] = useState(false)

  const index = order[pos] ?? 0
  const card = cards[index]

  const next = useCallback(() => { setFlipped(false); setPos(p => (p + 1) % order.length) }, [order.length])
  const prev = useCallback(() => { setFlipped(false); setPos(p => (p - 1 + order.length) % order.length) }, [order.length])

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
    return <NoData text="Žádné flashcards k dispozici. Přidej JSON soubory pro jednotlivé okruhy." />
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
    setPos(0); setFlipped(false); setShuffled(s => !s)
  }

  function reset() {
    setOrder(cards.map((_, i) => i))
    setPos(0); setFlipped(false); setDone([]); setShuffled(false)
  }

  return (
    <div className="space-y-4">
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
            🔀 Náhodně
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div
        className="cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
        role="button"
      >
        <div className={`card min-h-52 flex flex-col items-center justify-center text-center gap-3 transition-colors duration-200 ${
          flipped ? 'bg-brand-50 border-brand-200' : 'bg-white'
        } ${done.includes(index) ? 'opacity-60' : ''}`}>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {card?.label}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {flipped ? 'Odpověď' : 'Otázka'}
          </span>
          <p className={`text-base sm:text-lg leading-relaxed px-2 ${flipped ? 'text-brand-800' : 'text-slate-800'}`}>
            {flipped ? card?.odpoved : card?.otazka}
          </p>
          <p className="text-xs text-slate-300 mt-1">Space / klik · ← →</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button onClick={prev} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          ← Předchozí
        </button>
        <button
          onClick={toggleDone}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            done.includes(index) ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {done.includes(index) ? '✓ Zvládnuto' : 'Zvládnuto?'}
        </button>
        <button onClick={next} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Další →
        </button>
      </div>

      {done.length === cards.length && (
        <div className="card bg-emerald-50 border-emerald-200 text-center py-6">
          <p className="text-2xl mb-2">🏆</p>
          <p className="font-semibold text-emerald-700">Všechny kartičky ze všech okruhů zvládnuty!</p>
          <button onClick={reset} className="mt-3 text-sm text-emerald-600 underline">Začít znovu</button>
        </div>
      )}
    </div>
  )
}

function AllKviz({ questions }) {
  const [order] = useState(() => {
    const arr = questions.map((_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  if (questions.length === 0) {
    return <NoData text="Žádné kvízové otázky k dispozici. Přidej JSON soubory pro jednotlivé okruhy." />
  }

  const answered = Object.keys(answers).length
  const correct = Object.entries(answers).filter(([qi, ans]) => ans === questions[order[Number(qi)]]?.spravna).length

  function answer(qi, choice) {
    if (showResults) return
    setAnswers(a => ({ ...a, [qi]: choice }))
  }

  function reset() { setAnswers({}); setShowResults(false) }

  return (
    <div className="space-y-5">
      {!showResults && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Zodpovězeno: {answered} / {questions.length}</span>
          <span className="text-slate-300">Otázky jsou náhodně zamíchány</span>
        </div>
      )}

      {showResults && (
        <div className={`card text-center py-5 ${correct === questions.length ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-50 border-brand-200'}`}>
          <p className="text-3xl mb-1">{correct === questions.length ? '🏆' : correct >= questions.length / 2 ? '👍' : '📚'}</p>
          <p className="font-semibold text-lg text-slate-800">{correct} / {questions.length} správně</p>
          <p className="text-sm text-slate-500 mt-1">{scoreLabel(correct, questions.length)}</p>
          <button onClick={reset} className="mt-3 text-sm text-brand-600 underline font-medium">Zkusit znovu</button>
        </div>
      )}

      {order.map((qIdx, pos) => {
        const q = questions[qIdx]
        return (
          <div key={pos} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-slate-800 text-sm sm:text-base">
                <span className="text-brand-500 font-bold mr-1">{pos + 1}.</span>
                {q.otazka}
              </p>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap shrink-0">
                {q.label}
              </span>
            </div>
            <div className="space-y-2">
              {(q.moznosti ?? []).map((opt, oi) => {
                const isSelected = answers[pos] === oi
                const isCorrect = oi === q.spravna
                let cls = 'w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors duration-150 '

                if (!showResults) {
                  cls += isSelected
                    ? 'bg-brand-600 text-white border-brand-600 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                } else {
                  if (isCorrect) cls += 'bg-emerald-100 border-emerald-400 text-emerald-800 font-semibold'
                  else if (isSelected && !isCorrect) cls += 'bg-red-100 border-red-400 text-red-700'
                  else cls += 'bg-white border-slate-100 text-slate-400'
                }

                return (
                  <button key={oi} onClick={() => answer(pos, oi)} className={cls} disabled={answers[pos] !== undefined && !showResults}>
                    <span className="font-bold mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {showResults && isCorrect && <span className="ml-2">✓</span>}
                    {showResults && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                  </button>
                )
              })}
            </div>
            {showResults && q.vysvetleni && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-700">Vysvětlení: </span>{q.vysvetleni}
              </div>
            )}
          </div>
        )
      })}

      {answered === questions.length && !showResults && (
        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          Zobrazit výsledky
        </button>
      )}
    </div>
  )
}

function scoreLabel(correct, total) {
  const pct = correct / total
  if (pct === 1) return 'Perfektní skóre! Připraveni na zkoušku.'
  if (pct >= 0.8) return 'Výborně! Ještě trochu procvičit.'
  if (pct >= 0.5) return 'Slušný výsledek. Zopakuj slabší části.'
  return 'Je co zlepšovat. Projdi si učivo znovu.'
}

function NoData({ text }) {
  return (
    <div className="card text-center py-12 text-slate-400">
      <p className="text-3xl mb-3">📭</p>
      <p className="text-sm">{text}</p>
    </div>
  )
}
