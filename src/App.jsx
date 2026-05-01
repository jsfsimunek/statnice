import { useEffect, useState } from 'react'
import AdminPage from './components/AdminPage.jsx'
import AuthGate from './components/AuthGate.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import EditorPage from './components/EditorPage.jsx'
import Navigation from './components/Navigation.jsx'
import OkruhPage from './components/OkruhPage.jsx'
import OpakovaniPage from './components/OpakovaniPage.jsx'
import { SUBJECTS, getSubject } from './config/subjects.js'
import { useAuth } from './context/AuthContext.jsx'
import { PERMISSIONS } from './lib/permissions.js'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  )
}

function AppShell() {
  const auth = useAuth()
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0].slug)
  const [activeOkruh, setActiveOkruh] = useState(1)
  const [activeMode, setActiveMode] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [titles, setTitles] = useState({})
  const subject = getSubject(activeSubject)

  const isSignedIn = Boolean(auth.user)
  const canBrowse = true
  const canEdit = auth.can(PERMISSIONS.CONTENT_EDIT)
  const canManage = auth.can(PERMISSIONS.USERS_MANAGE) || auth.can(PERMISSIONS.ROLES_MANAGE)

  useEffect(() => {
    if ((isSignedIn || !isSupabaseConfigured) && activeMode === 'login') {
      setActiveMode('dashboard')
    }
  }, [activeMode, isSignedIn])

  function handleTitleLoaded(id, title) {
    setTitles(current => ({
      ...current,
      [activeSubject]: {
        ...(current[activeSubject] ?? {}),
        [id]: title,
      },
    }))
  }

  function handleSubjectChange(slug) {
    setActiveSubject(slug)
    setActiveOkruh(1)
    setSidebarOpen(false)
  }

  function handleModeChange(mode) {
    setActiveMode(mode)
    setSidebarOpen(false)
  }

  function handleTopicSelect(topicNumber) {
    setActiveOkruh(topicNumber)
    setActiveMode('study')
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {canBrowse && (
              <button
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                onClick={() => setSidebarOpen(value => !value)}
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
            )}
            <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-700 text-white grid place-items-center font-serif text-lg font-semibold">
              S
            </div>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-base leading-tight truncate text-slate-950">Státnice</p>
              <p className="text-slate-500 text-xs truncate">
                {isSignedIn || !isSupabaseConfigured ? `${subject.name} · studijní skupina` : `${subject.name} · veřejný náhled`}
              </p>
            </div>
          </div>

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            {canBrowse && (
              <div className="hidden lg:flex rounded-full bg-slate-100 p-1">
                <ModeButton active={activeMode === 'dashboard'} onClick={() => handleModeChange('dashboard')}>Přehled</ModeButton>
                <ModeButton active={activeMode === 'study'} onClick={() => handleModeChange('study')}>Studium</ModeButton>
                {canEdit && <ModeButton active={activeMode === 'editor'} onClick={() => handleModeChange('editor')}>Editor</ModeButton>}
                {canManage && <ModeButton active={activeMode === 'admin'} onClick={() => handleModeChange('admin')}>Admin</ModeButton>}
              </div>
            )}

            {canBrowse && (
              <span className="hidden max-w-[220px] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right text-xs text-slate-500 xl:block">
                {activeMode === 'admin'
                  ? 'Správa aplikace'
                  : activeMode === 'dashboard'
                    ? 'Přehled studia'
                  : activeMode === 'editor'
                    ? `Editor okruhu ${activeOkruh}`
                    : activeOkruh === 0
                      ? 'Opakování - vše dohromady'
                      : titles[activeSubject]?.[activeOkruh]
                        ? <span className="truncate max-w-xs block text-right">{titles[activeSubject][activeOkruh]}</span>
                        : `Okruh ${activeOkruh} / ${subject.topicCount || '?'}`
                }
              </span>
            )}

            {isSupabaseConfigured && auth.user ? (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 xl:flex">
                <div className="h-7 w-7 rounded-full bg-brand-50 text-brand-700 grid place-items-center">
                  <UserIcon />
                </div>
                <span className="max-w-[180px] truncate text-xs font-semibold text-slate-700">
                  {auth.user.email}
                </span>
              </div>
            ) : isSupabaseConfigured ? (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 xl:flex">
                <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 grid place-items-center">
                  <UserIcon />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Nepřihlášen
                </span>
              </div>
            ) : null}

            {activeMode === 'login' && !auth.user ? (
              <button
                type="button"
                onClick={() => handleModeChange('dashboard')}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-0 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto sm:px-3"
              >
                <span className="text-sm leading-none">←</span>
                <span className="hidden sm:inline">Zpět</span>
              </button>
            ) : isSupabaseConfigured && auth.user ? (
              <button
                type="button"
                onClick={() => {
                  auth.signOut()
                  setActiveMode('dashboard')
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-0 text-xs font-semibold text-white transition-colors hover:bg-slate-700 sm:w-auto sm:px-3"
                aria-label="Odhlásit"
                title="Odhlásit"
              >
                <LogOutIcon />
                <span className="hidden sm:inline">Odhlásit</span>
              </button>
            ) : isSupabaseConfigured ? (
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-0 text-xs font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto sm:px-3"
                aria-label="Přihlásit"
                title="Přihlásit"
              >
                <UserIcon />
                <span className="hidden sm:inline">Přihlásit</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {canBrowse && activeMode !== 'login' && (
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
              <Navigation
                subjects={SUBJECTS}
                activeSubject={activeSubject}
                onSubjectSelect={handleSubjectChange}
                okruhyCount={subject.topicCount}
                activeOkruh={activeOkruh}
                onSelect={handleTopicSelect}
                titles={titles[activeSubject]}
              />
            </div>
          </aside>
        )}

        {sidebarOpen && activeMode !== 'login' && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-50 w-72 bg-white shadow-xl p-4 overflow-y-auto">
              <button
                className="mb-4 text-slate-400 hover:text-slate-600 float-right text-lg leading-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Zavřít menu"
              >
                x
              </button>

              <div className="clear-both mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
                <MobileModeButton active={activeMode === 'dashboard'} onClick={() => handleModeChange('dashboard')}>Přehled</MobileModeButton>
                <MobileModeButton active={activeMode === 'study'} onClick={() => handleModeChange('study')}>Studium</MobileModeButton>
                {canEdit && <MobileModeButton active={activeMode === 'editor'} onClick={() => handleModeChange('editor')}>Editor</MobileModeButton>}
                {canManage && <MobileModeButton active={activeMode === 'admin'} onClick={() => handleModeChange('admin')}>Admin</MobileModeButton>}
              </div>

              <Navigation
                subjects={SUBJECTS}
                activeSubject={activeSubject}
                onSubjectSelect={handleSubjectChange}
                okruhyCount={subject.topicCount}
                activeOkruh={activeOkruh}
                onSelect={handleTopicSelect}
                titles={titles[activeSubject]}
              />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0">
          {activeMode === 'login' && !isSignedIn && isSupabaseConfigured ? (
            <LoginPage />
          ) : activeMode === 'dashboard' ? (
            <DashboardPage
              activeSubject={activeSubject}
              onSubjectSelect={handleSubjectChange}
              onTopicsLoaded={(subjectSlug, loadedTopics) => {
                setTitles(current => ({
                  ...current,
                  [subjectSlug]: {
                    ...(current[subjectSlug] ?? {}),
                    ...Object.fromEntries(loadedTopics.map(topic => [topic.id, topic.nazev ?? topic.title ?? `Okruh ${topic.id}`])),
                  },
                }))
              }}
              onOpenTopic={topicNumber => {
                setActiveOkruh(topicNumber)
                setActiveMode('study')
              }}
              onOpenReview={() => {
                setActiveOkruh(0)
                setActiveMode('study')
              }}
              onOpenEditor={topicNumber => {
                setActiveOkruh(topicNumber)
                setActiveMode('editor')
              }}
              canEdit={canEdit}
            />
          ) : activeMode === 'admin' && canManage ? (
            <AdminPage />
          ) : activeMode === 'editor' && canEdit ? (
            <EditorPage subjectSlug={activeSubject} topicNumber={Math.max(activeOkruh, 1)} />
          ) : activeOkruh === 0 ? (
            <OpakovaniPage subjectSlug={activeSubject} />
          ) : (
            <OkruhPage subjectSlug={activeSubject} okruhId={activeOkruh} onTitleLoaded={handleTitleLoaded} />
          )}
        </main>
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function MobileModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function LoginPage() {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)

    const payload = { email, password }
    const result = isRegister
      ? await auth.signUpWithPassword(payload)
      : await auth.signInWithPassword(payload)

    setSubmitting(false)

    if (!result?.error && isRegister) {
      setMode('login')
    }
  }

  return (
    <section id="prihlaseni" className="grid min-h-[calc(100vh-8rem)] items-center gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">Studijní skupina</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Přihlaš se a pokračuj v přípravě ke státnicím.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Účet drží pohromadě osobní progress, poznámky, kvízy a práva pro editor nebo admin správu obsahu.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <LoginFeature title="Obsah" text="Okruhy, flashcards a kvízy na jednom místě." />
          <LoginFeature title="Progress" text="Poznámky a hotové části se ukládají k účtu." />
          <LoginFeature title="Admin" text="Editace obsahu se zobrazí podle práv." />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card overflow-hidden p-0" aria-label="Přihlášení">
        <div className={`h-1.5 ${isRegister ? 'bg-emerald-500' : 'bg-brand-600'}`} />
        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isRegister ? 'Nový účet' : 'Přihlášení'}
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-slate-950">
              {isRegister ? 'Vytvořit přístup' : 'Vítej zpátky'}
            </h2>
          </div>

          {auth.authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {auth.authError}
            </div>
          )}

          <button
            type="button"
            onClick={() => auth.signInWithGoogle()}
            disabled={auth.oauthLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:text-slate-400"
          >
            <GoogleMark />
            {auth.oauthLoading ? 'Přesměrovávám...' : 'Pokračovat přes Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">nebo e-mailem</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="block text-sm font-medium text-slate-700">
            E-mail
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Heslo
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              required
              minLength={6}
            />
          </label>

          <button
            disabled={submitting}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-70 ${
              isRegister ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {submitting ? 'Zpracovávám...' : isRegister ? 'Vytvořit účet' : 'Přihlásit se'}
          </button>

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-sm text-slate-500">
              {isRegister ? 'Už účet máš?' : 'Jsi tu poprvé?'}
            </p>
            <button
              type="button"
              onClick={() => setMode(isRegister ? 'login' : 'register')}
              className={`mt-1 text-sm font-semibold ${isRegister ? 'text-brand-600 hover:text-brand-700' : 'text-emerald-600 hover:text-emerald-700'}`}
            >
              {isRegister ? 'Přejít na přihlášení' : 'Vytvořit nový účet'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}

function LoginFeature({ title, text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z M4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0-3-3m3 3H9" />
    </svg>
  )
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}
