import { DEFAULT_ROLES, PERMISSIONS } from './permissions.js'
import { isSupabaseConfigured, supabase } from './supabaseClient.js'

const DEFAULT_CLASS_NAME = 'Statnice 2026'

export async function getAdminOverview() {
  if (!isSupabaseConfigured) {
    return {
      roles: DEFAULT_ROLES.map((role, index) => ({
        id: role.name,
        name: role.name,
        label: role.label,
        permissionKeys: role.permissions,
        order: index,
      })),
      permissions: Object.values(PERMISSIONS).map(key => ({ id: key, key, label: key })),
      classes: [{ id: 'dev', name: DEFAULT_CLASS_NAME, description: 'Lokální dev skupina.' }],
      members: [],
    }
  }

  const [rolesResult, permissionsResult, rolePermissionsResult, classesResult] = await Promise.all([
    supabase.from('roles').select('id, name, label').order('label'),
    supabase.from('permissions').select('id, key, label').order('key'),
    supabase.from('role_permissions').select('role_id, permissions(key)'),
    supabase.from('classes').select('id, name, description').order('created_at', { ascending: true }),
  ])

  throwIf(rolesResult.error, 'Načtení rolí selhalo')
  throwIf(permissionsResult.error, 'Načtení oprávnění selhalo')
  throwIf(rolePermissionsResult.error, 'Načtení matice práv selhalo')
  throwIf(classesResult.error, 'Načtení skupin selhalo')

  const permissionKeysByRole = new Map()
  for (const row of rolePermissionsResult.data ?? []) {
    const current = permissionKeysByRole.get(row.role_id) ?? []
    if (row.permissions?.key) {
      current.push(row.permissions.key)
    }
    permissionKeysByRole.set(row.role_id, current)
  }

  const roles = (rolesResult.data ?? []).map(role => ({
    ...role,
    permissionKeys: permissionKeysByRole.get(role.id) ?? [],
  }))

  const classes = classesResult.data ?? []
  const activeClass = classes.find(item => item.name === DEFAULT_CLASS_NAME) ?? classes[0]
  const members = activeClass ? await getClassMembers(activeClass.id) : []

  return {
    roles,
    permissions: permissionsResult.data ?? [],
    classes,
    activeClassId: activeClass?.id ?? null,
    members,
  }
}

export async function updateClassMemberRole(memberId, roleId) {
  const { error } = await supabase
    .from('class_members')
    .update({ role_id: roleId })
    .eq('id', memberId)

  throwIf(error, 'Změna role selhala')
}

export async function addClassMemberByEmail(classId, email, roleId) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Zadej e-mail uživatele.')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  throwIf(profileError, 'Vyhledání uživatele selhalo')

  if (!profile) {
    throw new Error('Uživatel s tímto e-mailem ještě nemá účet v aplikaci.')
  }

  const { error } = await supabase
    .from('class_members')
    .upsert({
      class_id: classId,
      user_id: profile.id,
      role_id: roleId,
    }, { onConflict: 'class_id,user_id' })

  throwIf(error, 'Přidání uživatele selhalo')
}

export async function removeClassMember(memberId) {
  const { error } = await supabase
    .from('class_members')
    .delete()
    .eq('id', memberId)

  throwIf(error, 'Odebrání uživatele selhalo')
}

async function getClassMembers(classId) {
  const { data, error } = await supabase
    .from('class_members')
    .select(`
      id,
      created_at,
      class_id,
      role_id,
      profiles(id, email, display_name),
      roles(id, name, label)
    `)
    .eq('class_id', classId)
    .order('created_at', { ascending: true })

  throwIf(error, 'Načtení členů skupiny selhalo')

  return data ?? []
}

function throwIf(error, fallbackMessage) {
  if (error) {
    throw new Error(error.message || fallbackMessage)
  }
}
