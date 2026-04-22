import { useState, useEffect } from 'react'
import PodotazkaView from './PodotazkaView.jsx'

export default function OkruhPage({ okruhId, onTitleLoaded }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activePodotazka, setActivePodotazka] = useState(0)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setData(null)
    setActivePodotazka(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const base = import.meta.env.BASE_URL
    fetch(`${base}data/okruh${okruhId}.json`)
      .then(res => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
        onTitleLoaded?.(okruhId, json.nazev)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [okruhId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return <PlaceholderPage okruhId={okruhId} />
  }

  const podotazky = data.podotazky ?? []

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Okruh {data.id}</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">{data.nazev}</h1>
      </div>

      {podotazky.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {podotazky.map((p, idx) => (
            <button
              key={p.pismeno}
              onClick={() => setActivePodotazka(idx)}
              className={`tab-btn ${activePodotazka === idx ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              Podotázka {p.pismeno}
            </button>
          ))}
        </div>
      )}

      {podotazky[activePodotazka] && (
        <PodotazkaView
          key={`${okruhId}-${activePodotazka}`}
          podotazka={podotazky[activePodotazka]}
          okruhId={okruhId}
        />
      )}
    </div>
  )
}

function PlaceholderPage({ okruhId }) {
  return (
    <div className="card flex flex-col items-center text-center py-16 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">📂</div>
      <div>
        <h2 className="font-serif text-xl font-semibold text-slate-700 mb-1">Okruh {okruhId} zatím nemá data</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Přidej soubor <code className="bg-slate-100 px-1 rounded text-xs">public/data/okruh{okruhId}.json</code> ve správném formátu a obsah se automaticky načte.
        </p>
      </div>
    </div>
  )
}
