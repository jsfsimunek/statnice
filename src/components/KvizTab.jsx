import { useState } from 'react'

export default function KvizTab({ kviz, results = [], onResult }) {
  const questions = kviz ?? []
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  if (questions.length === 0) {
    return <EmptyState />
  }

  const answered = Object.keys(answers).length
  const correct = Object.entries(answers).filter(([questionIndex, answer]) => answer === questions[questionIndex]?.spravna).length
  const lastResult = results.at?.(-1)

  function answer(questionIndex, choice) {
    if (showResults) return
    setAnswers(current => ({ ...current, [questionIndex]: choice }))
  }

  function finish() {
    setShowResults(true)
    onResult?.({
      correct,
      total: questions.length,
      answers,
      finishedAt: new Date().toISOString(),
    })
  }

  function reset() {
    setAnswers({})
    setShowResults(false)
  }

  return (
    <div className="space-y-5">
      {!showResults && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Zodpovezeno: {answered} / {questions.length}</span>
          {results.length > 0 && <span>Pokusu: {results.length}</span>}
        </div>
      )}

      {lastResult && !showResults && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Posledni vysledek: <span className="font-semibold text-slate-800">{lastResult.correct} / {lastResult.total}</span>
        </div>
      )}

      {showResults && (
        <div className={`card text-center py-5 ${correct === questions.length ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-50 border-brand-200'}`}>
          <p className="font-semibold text-lg text-slate-800">{correct} / {questions.length} spravne</p>
          <p className="text-sm text-slate-500 mt-1">{scoreLabel(correct, questions.length)}</p>
          <button onClick={reset} className="mt-3 text-sm text-brand-600 underline font-medium">Zkusit znovu</button>
        </div>
      )}

      {questions.map((question, questionIndex) => (
        <QuestionCard
          key={questionIndex}
          question={question}
          questionIndex={questionIndex}
          selected={answers[questionIndex]}
          showResults={showResults}
          onAnswer={choice => answer(questionIndex, choice)}
        />
      ))}

      {answered === questions.length && !showResults && (
        <button
          onClick={finish}
          className="w-full py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
        >
          Zobrazit vysledky
        </button>
      )}
    </div>
  )
}

function QuestionCard({ question, questionIndex, selected, showResults, onAnswer }) {
  const isAnswered = selected !== undefined

  return (
    <div className="card space-y-3">
      <p className="font-medium text-slate-800 text-sm sm:text-base">
        <span className="text-brand-500 font-bold mr-1">{questionIndex + 1}.</span>
        {question.otazka}
      </p>
      <div className="space-y-2">
        {(question.moznosti ?? []).map((option, optionIndex) => {
          const isSelected = selected === optionIndex
          const isCorrect = optionIndex === question.spravna
          let cls = 'w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors duration-150 '

          if (!showResults) {
            cls += isSelected
              ? 'bg-brand-600 text-white border-brand-600 font-medium'
              : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50'
          } else if (isCorrect) {
            cls += 'bg-emerald-100 border-emerald-400 text-emerald-800 font-semibold'
          } else if (isSelected && !isCorrect) {
            cls += 'bg-red-100 border-red-400 text-red-700'
          } else {
            cls += 'bg-white border-slate-100 text-slate-400'
          }

          return (
            <button key={optionIndex} onClick={() => onAnswer(optionIndex)} className={cls} disabled={isAnswered && !showResults}>
              <span className="font-bold mr-2 opacity-60">{String.fromCharCode(65 + optionIndex)}.</span>
              {option}
              {showResults && isCorrect && <span className="ml-2">OK</span>}
              {showResults && isSelected && !isCorrect && <span className="ml-2">X</span>}
            </button>
          )
        })}
      </div>

      {showResults && question.vysvetleni && (
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 border border-slate-100">
          <span className="font-semibold text-slate-700">Vysvetleni: </span>
          {question.vysvetleni}
        </div>
      )}
    </div>
  )
}

function scoreLabel(correct, total) {
  const pct = correct / total
  if (pct === 1) return 'Perfektni skore.'
  if (pct >= 0.8) return 'Vyborne, staci doladit detaily.'
  if (pct >= 0.5) return 'Slusny vysledek, projdi slabsi casti.'
  return 'Je potreba se k tomu jeste vratit.'
}

function EmptyState() {
  return (
    <div className="card text-center py-12 text-slate-400">
      <p className="text-sm">Pro tuto podotazku zatim nejsou zadne kvizove otazky.</p>
    </div>
  )
}
