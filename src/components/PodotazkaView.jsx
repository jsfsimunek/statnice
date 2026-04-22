import { useState } from 'react'
import UcivoTab from './UcivoTab.jsx'
import FlashcardsTab from './FlashcardsTab.jsx'
import KvizTab from './KvizTab.jsx'

const TABS = [
  { id: 'ucivo', label: '📖 Učivo' },
  { id: 'flashcards', label: '🃏 Flashcards' },
  { id: 'kviz', label: '✏️ Kvíz' },
]

export default function PodotazkaView({ podotazka, okruhId }) {
  const [activeTab, setActiveTab] = useState('ucivo')
  const storageKey = `checklist-${okruhId}-${podotazka.pismeno}`

  return (
    <div>
      {/* Sub-question text */}
      <div className="card mb-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Podotázka {podotazka.pismeno}
        </p>
        <p className="text-slate-700 text-base leading-relaxed">{podotazka.zneni}</p>
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

      {/* Tabs rendered but hidden to preserve state */}
      <div className={activeTab === 'ucivo' ? '' : 'hidden'}>
        <UcivoTab studium={podotazka.studium} storageKey={storageKey} />
      </div>
      <div className={activeTab === 'flashcards' ? '' : 'hidden'}>
        <FlashcardsTab flashcards={podotazka.flashcards} />
      </div>
      <div className={activeTab === 'kviz' ? '' : 'hidden'}>
        <KvizTab kviz={podotazka.kviz} />
      </div>
    </div>
  )
}
