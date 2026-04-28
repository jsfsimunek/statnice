import { useEffect, useState } from 'react'
import FlashcardsTab from './FlashcardsTab.jsx'
import KvizTab from './KvizTab.jsx'
import { getTopics } from '../lib/contentRepository.js'
import { useUserProgress } from '../hooks/useUserProgress.js'

const TABS = [
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'kviz', label: 'Kviz' },
]

export default function OpakovaniPage({ subjectSlug }) {
  const [activeTab, setActiveTab] = useState('flashcards')
  const [cards, setCards] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  const { progress, updateProgress } = useUserProgress(`${subjectSlug}-opakovani`)

  useEffect(() => {
    setLoading(true)

    getTopics(subjectSlug)
      .then(topics => {
        const nextCards = []
        const nextQuestions = []

        topics.forEach(topic => {
          const topicLabel = `Okruh ${topic.id}`

          ;(topic.podotazky ?? []).forEach(subquestion => {
            const label = `${topicLabel} / ${subquestion.pismeno}`

            ;(subquestion.flashcards ?? []).forEach(card => {
              nextCards.push({ ...card, label })
            })

            ;(subquestion.kviz ?? []).forEach(question => {
              nextQuestions.push({ ...question, label })
            })
          })
        })

        setCards(nextCards)
        setQuestions(nextQuestions)
        setLoadedCount(topics.length)
      })
      .catch(() => {
        setCards([])
        setQuestions([])
        setLoadedCount(0)
      })
      .finally(() => setLoading(false))
  }, [subjectSlug])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm text-slate-400">Nacitam okruhy...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Opakovani</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
          Vse dohromady
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {loadedCount} okruhu / {cards.length} flashcards / {questions.length} otazek
        </p>
      </div>

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

      {activeTab === 'flashcards' && (
        <FlashcardsTab
          flashcards={cards}
          done={progress.flashcardsDone}
          onDoneChange={next => updateProgress(current => ({ ...current, flashcardsDone: next }))}
        />
      )}
      {activeTab === 'kviz' && (
        <KvizTab
          kviz={questions}
          results={progress.quizResults}
          onResult={result => updateProgress(current => ({
            ...current,
            quizResults: [...(current.quizResults ?? []), result],
          }))}
        />
      )}
    </div>
  )
}
