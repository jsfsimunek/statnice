import { useEffect, useMemo, useState } from 'react'
import {
  addClassMemberByEmail,
  getAdminOverview,
  removeClassMember,
  updateClassMemberRole,
} from '../lib/adminRepository.js'
import { DEFAULT_ROLES, PERMISSIONS } from '../lib/permissions.js'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'

const PERMISSION_LABELS = {
  [PERMISSIONS.USERS_MANAGE]: 'Uživatelé',
  [PERMISSIONS.ROLES_MANAGE]: 'Role a práva',
  [PERMISSIONS.CLASSES_MANAGE]: 'Skupiny',
  [PERMISSIONS.SUBJECTS_MANAGE]: 'Předměty',
  [PERMISSIONS.CONTENT_VIEW]: 'Čtení obsahu',
  [PERMISSIONS.CONTENT_CREATE]: 'Tvorba obsahu',
  [PERMISSIONS.CONTENT_EDIT]: 'Editace učiva',
  [PERMISSIONS.CONTENT_DELETE]: 'Mazání obsahu',
  [PERMISSIONS.CONTENT_PUBLISH]: 'Publikování',
  [PERMISSIONS.FLASHCARDS_EDIT]: 'Flashcards',
  [PERMISSIONS.QUIZZES_EDIT]: 'Kvízy',
}

export default function AdminPage() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRoleId, setMemberRoleId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOverview()
  }, [])

  const roles = overview?.roles ?? DEFAULT_ROLES.map(role => ({
    id: role.name,
    name: role.name,
    label: role.label,
    permissionKeys: role.permissions,
  }))
  const permissions = overview?.permissions ?? Object.values(PERMISSIONS).map(key => ({ id: key, key, label: key }))
  const members = overview?.members ?? []
  const activeClass = useMemo(
    () => overview?.classes?.find(item => item.id === overview.activeClassId) ?? overview?.classes?.[0],
    [overview]
  )
  const defaultRoleId = roles.find(role => role.name === 'student')?.id ?? roles[0]?.id ?? ''
  const selectedRoleId = memberRoleId || defaultRoleId

  useEffect(() => {
    if (!memberRoleId && defaultRoleId) {
      setMemberRoleId(defaultRoleId)
    }
  }, [defaultRoleId, memberRoleId])

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
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1">Správa</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
          Admin panel
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Správa členů skupiny, rolí a oprávnění pro editor.
        </p>
      </div>

      {!isSupabaseConfigured && (
        <div className="card border-amber-200 bg-amber-50">
          <h2 className="font-semibold text-amber-900 mb-1">Dev režim</h2>
          <p className="text-sm text-amber-800">
            Supabase není nastavené, proto máš lokálně všechna práva.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminCard title="Skupina" value={activeClass?.name ?? 'Bez skupiny'} text={activeClass?.description ?? 'Skupina zatím není vytvořená.'} />
        <AdminCard title="Členové" value={String(members.length)} text="Uživatelé s přiřazenou rolí ve skupině." />
        <AdminCard title="Role" value={String(roles.length)} text="Admin, editor a student podle databázové matice práv." />
      </section>

      <section className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-heading mb-1">Členové skupiny</h2>
            <p className="text-sm text-slate-500">
              Uživatel musí mít už vytvořený účet v aplikaci. Potom ho můžeš přidat podle e-mailu a vybrat roli.
            </p>
          </div>
        </div>

        {isSupabaseConfigured && activeClass && (
          <form onSubmit={handleAddMember} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_180px_auto]">
            <input
              type="email"
              value={memberEmail}
              onChange={event => setMemberEmail(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="student@example.com"
              required
            />
            <select
              value={selectedRoleId}
              onChange={event => setMemberRoleId(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </select>
            <button
              disabled={saving}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
            >
              Přidat
            </button>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Uživatel</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Role</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">Akce</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td className="px-3 py-5 text-center text-slate-500" colSpan={3}>
                    Ve skupině zatím nejsou žádní členové.
                  </td>
                </tr>
              ) : members.map(member => (
                <tr key={member.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 text-slate-700">
                    <span className="font-medium">{member.profiles?.display_name ?? member.profiles?.email}</span>
                    <span className="block text-xs text-slate-400">{member.profiles?.email}</span>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={member.role_id}
                      onChange={event => handleRoleChange(member.id, event.target.value)}
                      disabled={!isSupabaseConfigured || saving}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={!isSupabaseConfigured || saving}
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Odebrat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="section-heading mb-1">Role a oprávnění</h2>
            <p className="text-sm text-slate-500">
              Matice vychází z databáze. Změny oprávnění jsou zatím připravené jako další krok.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Oprávnění</th>
                {roles.map(role => (
                  <th key={role.id} className="px-3 py-2 text-center font-semibold text-slate-600">{role.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission, index) => (
                <tr key={permission.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-3 py-2 text-slate-700">
                    <span className="font-medium">{PERMISSION_LABELS[permission.key] ?? permission.label}</span>
                    <span className="block text-xs text-slate-400">{permission.key}</span>
                  </td>
                  {roles.map(role => (
                    <td key={role.id} className="px-3 py-2 text-center">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                        role.permissionKeys.includes(permission.key)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-300'
                      }`}>
                        {role.permissionKeys.includes(permission.key) ? '✓' : '-'}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )

  async function loadOverview() {
    setLoading(true)
    setError('')
    try {
      setOverview(await getAdminOverview())
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMember(event) {
    event.preventDefault()
    if (!activeClass || !selectedRoleId) return

    await runAdminAction(async () => {
      await addClassMemberByEmail(activeClass.id, memberEmail, selectedRoleId)
      setMemberEmail('')
      setMessage('Uživatel byl přidán do skupiny.')
    })
  }

  async function handleRoleChange(memberId, roleId) {
    await runAdminAction(async () => {
      await updateClassMemberRole(memberId, roleId)
      setMessage('Role byla změněna.')
    })
  }

  async function handleRemoveMember(memberId) {
    await runAdminAction(async () => {
      await removeClassMember(memberId)
      setMessage('Uživatel byl odebrán ze skupiny.')
    })
  }

  async function runAdminAction(action) {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await action()
      await loadOverview()
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setSaving(false)
    }
  }
}

function AdminCard({ title, value, text }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="font-serif text-xl font-semibold text-slate-900 mt-1">{value}</p>
      <p className="text-sm text-slate-500 mt-2">{text}</p>
    </div>
  )
}
