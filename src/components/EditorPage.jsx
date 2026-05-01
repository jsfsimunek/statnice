import { useEffect, useMemo, useState } from 'react'
import { getTopic, saveTopic } from '../lib/contentRepository.js'
import { getSubject } from '../config/subjects.js'
import { uploadContentImage } from '../lib/imageRepository.js'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function EditorPage({ subjectSlug, topicNumber }) {
  const [source, setSource] = useState(null)
  const [draft, setDraft] = useState('')
  const [topicTitle, setTopicTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [editorMode, setEditorMode] = useState('form')
  const subject = getSubject(subjectSlug)

  useEffect(() => {
    setLoading(true)
    setError('')

    getTopic(subjectSlug, topicNumber)
      .then(topic => {
        setSource(topic)
        setDraft(JSON.stringify(topic, null, 2))
        setTopicTitle(topic.nazev ?? topic.title ?? '')
      })
      .catch(() => {
        setSource(null)
        setDraft('')
        setTopicTitle('')
        setError('Tenhle okruh zatim nema obsah.')
      })
      .finally(() => setLoading(false))
  }, [subjectSlug, topicNumber])

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(draft)
      return { value: withTopicTitle(value, topicTitle), error: null }
    } catch (parseError) {
      return { value: null, error: parseError.message }
    }
  }, [draft, topicTitle])

  const stats = getStats(parsed.value)
  const validation = useMemo(() => validateTopic(parsed.value), [parsed.value])
  const exportUrl = useMemo(() => {
    if (!parsed.value || typeof URL === 'undefined') return null
    const blob = new Blob([JSON.stringify(parsed.value, null, 2)], { type: 'application/json' })
    return URL.createObjectURL(blob)
  }, [parsed.value])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Editor</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
          {subject.name} · okruh {topicNumber}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Úprava názvu, kontrola JSONu a uložení okruhu do databáze.
        </p>
      </div>

      {error && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Podotázky" value={stats.subquestions} />
        <Stat label="Sekce" value={stats.sections} />
        <Stat label="Flashcards" value={stats.flashcards} />
        <Stat label="Kvízové otázky" value={stats.quizQuestions} />
      </div>

      <section className="card space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="block text-sm font-semibold text-slate-700">
            Název okruhu
            <input
              type="text"
              value={topicTitle}
              onChange={event => setTopicTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="Zadej název okruhu"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            Tohle pole mění název v databázi i v JSONu. Po uložení se projeví ve studiu a navigaci.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="section-heading mb-1">JSON okruhu</h2>
            <p className="text-sm text-slate-500">
              Formulář upravuje nejběžnější pole a JSON zůstává dostupný pro pokročilé zásahy.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!source) return
                setDraft(JSON.stringify(source, null, 2))
                setTopicTitle(source.nazev ?? source.title ?? '')
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Vrátit změny
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isSupabaseConfigured || Boolean(parsed.error) || validation.errors.length > 0 || saving}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                !isSupabaseConfigured || parsed.error || validation.errors.length > 0 || saving
                  ? 'bg-slate-100 text-slate-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {saving ? 'Ukládám...' : 'Uložit'}
            </button>
            <a
              href={exportUrl ?? undefined}
              download={`${subjectSlug}-okruh-${topicNumber}.json`}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                parsed.error
                  ? 'pointer-events-none bg-slate-100 text-slate-300'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              Export JSON
            </a>
          </div>
        </div>

        <div className="inline-flex w-fit rounded-full bg-slate-100 p-1">
          <ModeSwitchButton active={editorMode === 'form'} onClick={() => setEditorMode('form')}>Formulář</ModeSwitchButton>
          <ModeSwitchButton active={editorMode === 'json'} onClick={() => setEditorMode('json')}>JSON</ModeSwitchButton>
        </div>

        {!parsed.error && (
          <ValidationPanel validation={validation} />
        )}

        {editorMode === 'form' ? (
          <TopicFormEditor
            subjectSlug={subjectSlug}
            topicNumber={topicNumber}
            topic={parsed.value}
            disabled={Boolean(parsed.error)}
            onChange={handleTopicFormChange}
          />
        ) : (
          <textarea
            value={draft}
            onChange={handleDraftChange}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y rounded-xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Sem vlož JSON okruhu..."
          />
        )}

        <div className={`rounded-xl px-3 py-2 text-sm ${
          parsed.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {parsed.error ? `JSON není validní: ${parsed.error}` : 'JSON je validní.'}
        </div>

        {isSupabaseConfigured ? (
          <p className="text-sm text-slate-500">
            Supabase je nastavené. Tlačítko Uložit přepíše aktuální okruh podle JSONu, pokud má uživatel oprávnění content.edit.
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Lokální režim: exportovaný JSON můžeš později vložit do hlavního importního souboru.
          </p>
        )}

        {saveMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {saveMessage}
          </div>
        )}
      </section>
    </div>
  )

  async function handleSave() {
    if (!parsed.value || parsed.error) return
    if (validation.errors.length > 0) {
      setError('Okruh má validační chyby. Oprav je před uložením.')
      return
    }

    setSaving(true)
    setSaveMessage('')
    setError('')

    try {
      await saveTopic(subjectSlug, parsed.value)
      setSource(parsed.value)
      setDraft(JSON.stringify(parsed.value, null, 2))
      setTopicTitle(parsed.value.nazev ?? parsed.value.title ?? '')
      setSaveMessage('Okruh byl uložen do databáze.')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  function handleDraftChange(event) {
    const nextDraft = event.target.value
    setDraft(nextDraft)

    try {
      const nextTopic = JSON.parse(nextDraft)
      const nextTitle = nextTopic.nazev ?? nextTopic.title
      if (typeof nextTitle === 'string') {
        setTopicTitle(nextTitle)
      }
    } catch {
      // Keep the title input stable while the JSON is temporarily invalid.
    }
  }

  function handleTopicFormChange(mutator) {
    if (parsed.error) return

    try {
      const nextTopic = JSON.parse(draft)
      mutator(nextTopic)
      const nextTitle = nextTopic.nazev ?? nextTopic.title
      if (typeof nextTitle === 'string') {
        setTopicTitle(nextTitle)
      }
      setDraft(JSON.stringify(nextTopic, null, 2))
    } catch {
      setError('Formulář nejde použít, dokud JSON není validní.')
    }
  }
}

function withTopicTitle(topic, title) {
  if (!topic) return topic

  return {
    ...topic,
    nazev: title,
    title,
  }
}

function Stat({ label, value }) {
  return (
    <div className="card py-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  )
}

function ModeSwitchButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function ValidationPanel({ validation }) {
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        Obsah prošel kontrolou. Uložení nic neblokuje.
      </div>
    )
  }

  return (
    <div className={`rounded-xl border px-3 py-3 text-sm ${
      validation.errors.length > 0
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-800'
    }`}>
      <p className="font-semibold">
        {validation.errors.length > 0 ? 'Před uložením je potřeba opravit chyby.' : 'Obsah má jen doporučení ke kontrole.'}
      </p>
      {validation.errors.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {validation.errors.map(item => <li key={item}>{item}</li>)}
        </ul>
      )}
      {validation.warnings.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {validation.warnings.map(item => <li key={item}>{item}</li>)}
        </ul>
      )}
    </div>
  )
}

function TopicFormEditor({ subjectSlug, topicNumber, topic, disabled, onChange }) {
  const subquestions = topic?.podotazky ?? []

  if (disabled || !topic) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Formulář se zobrazí po opravě JSONu.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {subquestions.map((subquestion, subIndex) => (
        <details key={`${subquestion.pismeno ?? subIndex}-${subIndex}`} className="rounded-xl border border-slate-200 bg-white" open={subIndex === 0}>
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800">
            Podotázka {subquestion.pismeno ?? subIndex + 1}
          </summary>

          <div className="space-y-4 border-t border-slate-100 p-4">
            <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
              <label className="block text-sm font-medium text-slate-700">
                Písmeno
                <input
                  type="text"
                  value={subquestion.pismeno ?? ''}
                  onChange={event => onChange(topicDraft => {
                    topicDraft.podotazky[subIndex].pismeno = event.target.value
                  })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Znění
                <textarea
                  value={subquestion.zneni ?? ''}
                  onChange={event => onChange(topicDraft => {
                    topicDraft.podotazky[subIndex].zneni = event.target.value
                  })}
                  className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
            </div>

            <EditableList
              title="Studijní sekce"
              items={subquestion.studium?.sekce ?? []}
              emptyText="Tahle podotázka zatím nemá studijní sekce."
              onAdd={() => onChange(topicDraft => {
                ensureStudy(topicDraft.podotazky[subIndex]).sekce.push({ nadpis: 'Nová sekce', obsah: '' })
              })}
              onMove={(fromIndex, toIndex) => onChange(topicDraft => {
                moveItem(ensureStudy(topicDraft.podotazky[subIndex]).sekce, fromIndex, toIndex)
              })}
              onDuplicate={sectionIndex => onChange(topicDraft => {
                duplicateItem(ensureStudy(topicDraft.podotazky[subIndex]).sekce, sectionIndex)
              })}
              onRemove={sectionIndex => onChange(topicDraft => {
                ensureStudy(topicDraft.podotazky[subIndex]).sekce.splice(sectionIndex, 1)
              })}
              renderItem={(section, sectionIndex) => (
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={section.nadpis ?? ''}
                    onChange={event => onChange(topicDraft => {
                      ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex].nadpis = event.target.value
                    })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Nadpis sekce"
                  />
                  <textarea
                    value={section.obsah ?? ''}
                    onChange={event => onChange(topicDraft => {
                      ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex].obsah = event.target.value
                    })}
                    className="min-h-28 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Obsah sekce"
                  />
                  <ImageEditor
                    images={section.obrazky ?? []}
                    uploadContext={{
                      subjectSlug,
                      topicNumber,
                      subquestionLetter: subquestion.pismeno ?? subIndex + 1,
                      sectionIndex,
                    }}
                    onAddUrl={() => onChange(topicDraft => {
                      ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky')
                        .push({ src: '', popis: '' })
                    })}
                    onUpload={async file => {
                      const url = await uploadContentImage(file, {
                        subjectSlug,
                        topicNumber,
                        subquestionLetter: subquestion.pismeno ?? subIndex + 1,
                        sectionIndex,
                      })

                      onChange(topicDraft => {
                        ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky')
                          .push({ src: url, popis: file.name.replace(/\.[^.]+$/, '') })
                      })
                    }}
                    onUpdate={(imageIndex, key, value) => onChange(topicDraft => {
                      ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky')[imageIndex][key] = value
                    })}
                    onMove={(fromIndex, toIndex) => onChange(topicDraft => {
                      moveItem(ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky'), fromIndex, toIndex)
                    })}
                    onDuplicate={imageIndex => onChange(topicDraft => {
                      duplicateItem(ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky'), imageIndex)
                    })}
                    onRemove={imageIndex => onChange(topicDraft => {
                      ensureArray(ensureStudy(topicDraft.podotazky[subIndex]).sekce[sectionIndex], 'obrazky').splice(imageIndex, 1)
                    })}
                  />
                </div>
              )}
            />

            <EditableList
              title="Flashcards"
              items={subquestion.flashcards ?? []}
              emptyText="Tahle podotázka zatím nemá flashcards."
              onAdd={() => onChange(topicDraft => {
                ensureArray(topicDraft.podotazky[subIndex], 'flashcards').push({ otazka: '', odpoved: '' })
              })}
              onMove={(fromIndex, toIndex) => onChange(topicDraft => {
                moveItem(ensureArray(topicDraft.podotazky[subIndex], 'flashcards'), fromIndex, toIndex)
              })}
              onDuplicate={cardIndex => onChange(topicDraft => {
                duplicateItem(ensureArray(topicDraft.podotazky[subIndex], 'flashcards'), cardIndex)
              })}
              onRemove={cardIndex => onChange(topicDraft => {
                ensureArray(topicDraft.podotazky[subIndex], 'flashcards').splice(cardIndex, 1)
              })}
              renderItem={(card, cardIndex) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea
                    value={card.otazka ?? ''}
                    onChange={event => onChange(topicDraft => {
                      ensureArray(topicDraft.podotazky[subIndex], 'flashcards')[cardIndex].otazka = event.target.value
                    })}
                    className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Otázka"
                  />
                  <textarea
                    value={card.odpoved ?? ''}
                    onChange={event => onChange(topicDraft => {
                      ensureArray(topicDraft.podotazky[subIndex], 'flashcards')[cardIndex].odpoved = event.target.value
                    })}
                    className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Odpověď"
                  />
                </div>
              )}
            />

            <EditableList
              title="Kvíz"
              items={subquestion.kviz ?? []}
              emptyText="Tahle podotázka zatím nemá kvízové otázky."
              onAdd={() => onChange(topicDraft => {
                ensureArray(topicDraft.podotazky[subIndex], 'kviz').push({
                  otazka: '',
                  moznosti: ['', '', '', ''],
                  spravna: 0,
                  vysvetleni: '',
                })
              })}
              onMove={(fromIndex, toIndex) => onChange(topicDraft => {
                moveItem(ensureArray(topicDraft.podotazky[subIndex], 'kviz'), fromIndex, toIndex)
              })}
              onDuplicate={quizIndex => onChange(topicDraft => {
                duplicateItem(ensureArray(topicDraft.podotazky[subIndex], 'kviz'), quizIndex)
              })}
              onRemove={quizIndex => onChange(topicDraft => {
                ensureArray(topicDraft.podotazky[subIndex], 'kviz').splice(quizIndex, 1)
              })}
              renderItem={(quiz, quizIndex) => (
                <div className="space-y-2">
                  <textarea
                    value={quiz.otazka ?? ''}
                    onChange={event => onChange(topicDraft => {
                      ensureArray(topicDraft.podotazky[subIndex], 'kviz')[quizIndex].otazka = event.target.value
                    })}
                    className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    placeholder="Kvízová otázka"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ensureDisplayOptions(quiz).map((option, optionIndex) => (
                      <label key={optionIndex} className="text-xs font-medium text-slate-500">
                        Možnost {optionIndex + 1}
                        <input
                          type="text"
                          value={option}
                          onChange={event => onChange(topicDraft => {
                            const nextQuiz = ensureArray(topicDraft.podotazky[subIndex], 'kviz')[quizIndex]
                            nextQuiz.moznosti = ensureDisplayOptions(nextQuiz)
                            nextQuiz.moznosti[optionIndex] = event.target.value
                          })}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                    <label className="text-xs font-medium text-slate-500">
                      Správná možnost
                      <select
                        value={normalizeCorrectIndex(quiz.spravna)}
                        onChange={event => onChange(topicDraft => {
                          ensureArray(topicDraft.podotazky[subIndex], 'kviz')[quizIndex].spravna = Number(event.target.value)
                        })}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      >
                        {[0, 1, 2, 3].map(index => (
                          <option key={index} value={index}>{index + 1}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-slate-500">
                      Vysvětlení
                      <input
                        type="text"
                        value={quiz.vysvetleni ?? ''}
                        onChange={event => onChange(topicDraft => {
                          ensureArray(topicDraft.podotazky[subIndex], 'kviz')[quizIndex].vysvetleni = event.target.value
                        })}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                  </div>
                </div>
              )}
            />
          </div>
        </details>
      ))}
    </div>
  )
}

function EditableList({ title, items, emptyText, onAdd, onMove, onDuplicate, onRemove, renderItem }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50"
        >
          Přidat
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
              {renderItem(item, index)}
              <ItemActions
                canMoveUp={index > 0}
                canMoveDown={index < items.length - 1}
                onMoveUp={() => onMove(index, index - 1)}
                onMoveDown={() => onMove(index, index + 1)}
                onDuplicate={() => onDuplicate(index)}
                onRemove={() => {
                  if (window.confirm('Opravdu odebrat tuhle položku?')) {
                    onRemove(index)
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ImageEditor({ images, uploadContext, onAddUrl, onUpload, onUpdate, onMove, onDuplicate, onRemove }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    setUploadError('')

    try {
      await onUpload(file, uploadContext)
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Obrázky v téhle sekci</h4>
          <p className="mt-0.5 text-xs text-slate-500">Pořadí tady odpovídá pořadí ve studijním textu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-slate-200 ${
            uploading
              ? 'bg-slate-100 text-slate-300'
              : 'bg-white text-brand-700 hover:bg-brand-50'
          }`}>
            {uploading ? 'Nahrávám...' : 'Nahrát'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
          <button
            type="button"
            onClick={onAddUrl}
            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Přidat URL
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {uploadError}
        </div>
      )}

      {images.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-3 text-sm text-slate-500">V téhle sekci zatím není žádný obrázek.</p>
      ) : (
        <div className="space-y-3">
          {images.map((image, imageIndex) => (
            <div key={imageIndex} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 lg:grid-cols-[160px_1fr]">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {image.src ? (
                    <img src={image.src} alt={image.popis ?? ''} className="h-32 w-full object-contain" loading="lazy" />
                  ) : (
                    <div className="grid h-32 place-items-center text-xs text-slate-400">Bez URL</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-500">
                    URL obrázku
                    <input
                      type="text"
                      value={image.src ?? ''}
                      onChange={event => onUpdate(imageIndex, 'src', event.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      placeholder="https://... nebo /statnice/images/..."
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-500">
                    Popisek
                    <input
                      type="text"
                      value={image.popis ?? ''}
                      onChange={event => onUpdate(imageIndex, 'popis', event.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      placeholder="Krátký popisek pod obrázkem"
                    />
                  </label>
                </div>
              </div>

              <ItemActions
                canMoveUp={imageIndex > 0}
                canMoveDown={imageIndex < images.length - 1}
                onMoveUp={() => onMove(imageIndex, imageIndex - 1)}
                onMoveDown={() => onMove(imageIndex, imageIndex + 1)}
                onDuplicate={() => onDuplicate(imageIndex)}
                onRemove={() => {
                  if (window.confirm('Opravdu odebrat tenhle obrázek ze sekce?')) {
                    onRemove(imageIndex)
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ItemActions({ canMoveUp, canMoveDown, onMoveUp, onMoveDown, onDuplicate, onRemove }) {
  return (
    <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Nahoru
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Dolů
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        Duplikovat
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Odebrat
      </button>
    </div>
  )
}

function ensureStudy(subquestion) {
  if (!subquestion.studium) {
    subquestion.studium = {}
  }
  if (!Array.isArray(subquestion.studium.sekce)) {
    subquestion.studium.sekce = []
  }
  return subquestion.studium
}

function ensureArray(target, key) {
  if (!Array.isArray(target[key])) {
    target[key] = []
  }
  return target[key]
}

function ensureDisplayOptions(quiz) {
  const options = Array.isArray(quiz.moznosti) ? quiz.moznosti : []
  return [...options, '', '', '', ''].slice(0, 4)
}

function normalizeCorrectIndex(value) {
  if (typeof value === 'number') {
    return Math.min(Math.max(value, 0), 3)
  }

  const asNumber = Number(value)
  if (Number.isFinite(asNumber)) {
    return Math.min(Math.max(asNumber, 0), 3)
  }

  return 0
}

function moveItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) return
  const [item] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, item)
}

function duplicateItem(items, index) {
  items.splice(index + 1, 0, JSON.parse(JSON.stringify(items[index])))
}

function validateTopic(topic) {
  const errors = []
  const warnings = []

  if (!topic) {
    return { errors, warnings }
  }

  if (!hasText(topic.nazev ?? topic.title)) {
    errors.push('Okruh nemá vyplněný název.')
  }

  const subquestions = topic.podotazky ?? []
  if (!Array.isArray(subquestions) || subquestions.length === 0) {
    errors.push('Okruh nemá žádné podotázky.')
    return { errors, warnings }
  }

  subquestions.forEach((subquestion, subIndex) => {
    const label = `Podotázka ${subquestion.pismeno || subIndex + 1}`
    if (!hasText(subquestion.pismeno)) {
      errors.push(`${label}: chybí písmeno.`)
    }
    if (!hasText(subquestion.zneni ?? subquestion.prompt)) {
      errors.push(`${label}: chybí znění.`)
    }

    const sections = subquestion.studium?.sekce ?? []
    if (sections.length === 0) {
      warnings.push(`${label}: nemá žádné studijní sekce.`)
    }
    sections.forEach((section, sectionIndex) => {
      if (!hasText(section.nadpis) && !hasText(section.obsah) && !Array.isArray(section.seznam) && !section.tabulka) {
        warnings.push(`${label}, sekce ${sectionIndex + 1}: sekce je prázdná.`)
      }
      ;(section.obrazky ?? section.images ?? []).forEach((image, imageIndex) => {
        if (!hasText(image.src)) {
          errors.push(`${label}, sekce ${sectionIndex + 1}, obrázek ${imageIndex + 1}: chybí URL obrázku.`)
        }
      })
    })

    ;(subquestion.flashcards ?? []).forEach((card, cardIndex) => {
      if (!hasText(card.otazka ?? card.question)) {
        errors.push(`${label}, flashcard ${cardIndex + 1}: chybí otázka.`)
      }
      if (!hasText(card.odpoved ?? card.answer)) {
        errors.push(`${label}, flashcard ${cardIndex + 1}: chybí odpověď.`)
      }
    })

    ;(subquestion.kviz ?? subquestion.quiz ?? []).forEach((quiz, quizIndex) => {
      const quizLabel = `${label}, kvíz ${quizIndex + 1}`
      const options = quiz.moznosti ?? quiz.options ?? []
      const correctIndex = normalizeCorrectIndex(quiz.spravna ?? quiz.correct)

      if (!hasText(quiz.otazka ?? quiz.question)) {
        errors.push(`${quizLabel}: chybí otázka.`)
      }
      if (!Array.isArray(options) || options.filter(hasText).length < 2) {
        errors.push(`${quizLabel}: musí mít aspoň dvě vyplněné možnosti.`)
      }
      if (Array.isArray(options) && !hasText(options[correctIndex])) {
        errors.push(`${quizLabel}: správná možnost není vyplněná.`)
      }
      if (!hasText(quiz.vysvetleni ?? quiz.explanation)) {
        warnings.push(`${quizLabel}: chybí vysvětlení.`)
      }
    })
  })

  return {
    errors: errors.slice(0, 12),
    warnings: warnings.slice(0, 12),
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function getStats(topic) {
  const subquestions = topic?.podotazky ?? []

  return {
    subquestions: subquestions.length,
    sections: subquestions.reduce((sum, item) => sum + (item.studium?.sekce?.length ?? 0), 0),
    flashcards: subquestions.reduce((sum, item) => sum + (item.flashcards?.length ?? 0), 0),
    quizQuestions: subquestions.reduce((sum, item) => sum + (item.kviz?.length ?? 0), 0),
  }
}
