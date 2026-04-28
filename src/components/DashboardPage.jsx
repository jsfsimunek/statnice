import { useEffect, useState } from 'react'
import { SUBJECTS, getSubject } from '../config/subjects.js'
import { getTopics } from '../lib/contentRepository.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardPage({ activeSubject, onSubjectSelect, onOpenTopic, onOpenReview, onOpenEditor, onTopicsLoaded, canEdit }) {
  const auth = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const subject = getSubject(activeSubject)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    getTopics(activeSubject)
      .then(nextTopics => {
        if (!cancelled) {
          setTopics(nextTopics)
          onTopicsLoaded?.(activeSubject, nextTopics)
        }
      })
      .catch(loadError => {
        if (!cancelled) setError(loadError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeSubject])

  const stats = getDashboardStats(topics)
  const nextTopic = topics[0]
  const recentTopics = topics.slice(0, 4)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Přehled</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {auth.user?.email ? `Ahoj, ${auth.user.email}` : 'Ahoj'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Rychlý vstup do studia, opakování a správy obsahu pro předmět {subject.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenTopic(nextTopic?.id ?? 1)}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Pokračovat
            </button>
            <button
              type="button"
              onClick={onOpenReview}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Opakování
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => onOpenEditor(nextTopic?.id ?? 1)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Editor
              </button>
            )}
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-4">
        <DashboardStat label="Okruhy" value={loading ? '...' : stats.topics} />
        <DashboardStat label="Podotázky" value={loading ? '...' : stats.subquestions} />
        <DashboardStat label="Flashcards" value={loading ? '...' : stats.flashcards} />
        <DashboardStat label="Kvízy" value={loading ? '...' : stats.quizQuestions} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="card">
          <h2 className="section-heading mb-3">Předměty</h2>
          <div className="space-y-2">
            {SUBJECTS.map(item => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onSubjectSelect(item.slug)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  item.slug === activeSubject
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-heading mb-1">Rychlé okruhy</h2>
              <p className="text-sm text-slate-500">První dostupné okruhy pro aktuální předmět.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
            </div>
          ) : recentTopics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentTopics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onOpenTopic(topic.id)}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-brand-200 hover:bg-brand-50"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">Okruh {topic.id}</span>
                  <span className="mt-1 block font-serif text-lg font-semibold text-slate-900">{topic.nazev ?? topic.title}</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {(topic.podotazky ?? []).length} podotázek
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Tenhle předmět zatím nemá importovaný obsah.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function DashboardStat({ label, value }) {
  return (
    <div className="card py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function getDashboardStats(topics) {
  return topics.reduce((acc, topic) => {
    const subquestions = topic.podotazky ?? []
    acc.topics += 1
    acc.subquestions += subquestions.length
    acc.flashcards += subquestions.reduce((sum, item) => sum + (item.flashcards?.length ?? 0), 0)
    acc.quizQuestions += subquestions.reduce((sum, item) => sum + (item.kviz?.length ?? 0), 0)
    return acc
  }, {
    topics: 0,
    subquestions: 0,
    flashcards: 0,
    quizQuestions: 0,
  })
}
