import { useState } from 'react'
import Navigation from './components/Navigation.jsx'
import OkruhPage from './components/OkruhPage.jsx'
import OpakovaniPage from './components/OpakovaniPage.jsx'

const OKRUHY_COUNT = 10

export default function App() {
  const [activeOkruh, setActiveOkruh] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [titles, setTitles] = useState({})

  function handleTitleLoaded(id, nazev) {
    setTitles(t => ({ ...t, [id]: nazev }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-brand-700 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-brand-600 transition-colors"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Menu"
            >
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-base leading-tight truncate">Státnice Geografie</p>
              <p className="text-brand-200 text-xs truncate">PdF MU Brno · Bc. program</p>
            </div>
          </div>
          <span className="text-brand-200 text-xs hidden sm:block whitespace-nowrap">
            {activeOkruh === 0
              ? 'Opakování – vše dohromady'
              : titles[activeOkruh]
                ? <span className="truncate max-w-xs block text-right">{titles[activeOkruh]}</span>
                : `Okruh ${activeOkruh} / ${OKRUHY_COUNT}`
            }
          </span>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20">
            <Navigation
              okruhyCount={OKRUHY_COUNT}
              activeOkruh={activeOkruh}
              onSelect={setActiveOkruh}
              titles={titles}
            />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-50 w-64 bg-white shadow-xl p-4 overflow-y-auto">
              <button
                className="mb-4 text-slate-400 hover:text-slate-600 float-right text-lg leading-none"
                onClick={() => setSidebarOpen(false)}
              >✕</button>
              <Navigation
                okruhyCount={OKRUHY_COUNT}
                activeOkruh={activeOkruh}
                onSelect={n => { setActiveOkruh(n); setSidebarOpen(false) }}
                titles={titles}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {activeOkruh === 0
            ? <OpakovaniPage />
            : <OkruhPage okruhId={activeOkruh} onTitleLoaded={handleTitleLoaded} />
          }
        </main>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
