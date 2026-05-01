import { useState } from 'react'
import FlashcardsTab from './FlashcardsTab.jsx'
import KvizTab from './KvizTab.jsx'
import NotesPanel from './NotesPanel.jsx'
import SwipeTab from './SwipeTab.jsx'
import UcivoTab from './UcivoTab.jsx'
import { useUserProgress } from '../hooks/useUserProgress.js'

const TABS = [
  { id: 'ucivo', label: 'Učivo' },
  { id: 'swipe', label: 'Swipe', hint: 'pro telefony' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'kviz', label: 'Kvíz' },
  { id: 'notes', label: 'Poznámky' },
]

export default function PodotazkaView({ podotazka, okruhId, okruhTitle }) {
  const [activeTab, setActiveTab] = useState('ucivo')
  const progressKey = `${okruhId}-${podotazka.pismeno}`
  const { progress, updateProgress, loading, error } = useUserProgress(progressKey)

  return (
    <div>
      <div className="card mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Podotázka {podotazka.pismeno}
        </p>
        {okruhTitle && (
          <p className="mb-2 text-xs font-medium text-brand-500">
            {okruhTitle}
          </p>
        )}
        <p className="text-slate-700 text-base leading-relaxed">{podotazka.zneni}</p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Progress se nepodařilo uložit: {error}
          </p>
        )}
      </div>

      <div className="flex gap-1 mb-5 p-1 bg-slate-100 rounded-full w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <span className="block leading-4">{tab.label}</span>
            {tab.hint && (
              <span className={`block text-[10px] font-medium leading-3 ${
                activeTab === tab.id ? 'text-brand-100' : 'text-slate-400'
              }`}>
                {tab.hint}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={activeTab === 'ucivo' ? '' : 'hidden'}>
        <UcivoTab
          studium={podotazka.studium}
          checked={progress.checklistDone}
          onCheckedChange={next => updateProgress(current => ({ ...current, checklistDone: next }))}
        />
      </div>
      <div className={activeTab === 'swipe' ? '' : 'hidden'}>
        <SwipeTab
          studium={podotazka.studium}
          progressKey={progressKey}
          onOpenDetail={() => setActiveTab('ucivo')}
        />
      </div>
      <div className={activeTab === 'flashcards' ? '' : 'hidden'}>
        <FlashcardsTab
          flashcards={podotazka.flashcards}
          done={progress.flashcardsDone}
          onDoneChange={next => updateProgress(current => ({ ...current, flashcardsDone: next }))}
        />
      </div>
      <div className={activeTab === 'kviz' ? '' : 'hidden'}>
        <KvizTab
          kviz={podotazka.kviz}
          results={progress.quizResults}
          onResult={result => updateProgress(current => ({
            ...current,
            quizResults: [...(current.quizResults ?? []), result],
          }))}
        />
      </div>
      <div className={activeTab === 'notes' ? '' : 'hidden'}>
        <NotesPanel
          loading={loading}
          value={progress.notes}
          onChange={notes => updateProgress(current => ({ ...current, notes }))}
        />
      </div>
    </div>
  )
}
