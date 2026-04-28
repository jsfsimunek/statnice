import fs from 'node:fs/promises'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

await loadDotEnv()

const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run grant:admin -- user@example.com')
  process.exit(1)
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: users, error: listError } = await supabase.auth.admin.listUsers()
throwIf(listError, 'list users')

const matchingUsers = users.users.filter(item => item.email?.toLowerCase() === email.toLowerCase())
if (matchingUsers.length === 0) {
  console.error(`User not found: ${email}`)
  process.exit(1)
}

const { data: role, error: roleError } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'admin')
  .single()
throwIf(roleError, 'find admin role')

let { data: group, error: groupError } = await supabase
  .from('classes')
  .select('id')
  .eq('name', 'Statnice 2026')
  .maybeSingle()
throwIf(groupError, 'find class')

if (!group) {
  const created = await supabase
    .from('classes')
    .insert({
      name: 'Statnice 2026',
      description: 'Spolecna skupina pro statnicovou pripravu.',
    })
    .select('id')
    .single()

  throwIf(created.error, 'create class')
  group = created.data
}

const { error: memberError } = await supabase
  .from('class_members')
  .upsert(
    await Promise.all(matchingUsers.map(async user => {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name ?? user.user_metadata?.display_name ?? user.email?.split('@')[0],
        }, { onConflict: 'id' })
      throwIf(profileError, `upsert profile ${user.id}`)

      return {
        class_id: group.id,
        user_id: user.id,
        role_id: role.id,
      }
    })),
    { onConflict: 'class_id,user_id' }
  )
throwIf(memberError, 'grant admin')

console.log(`Granted admin role to ${email} on ${matchingUsers.length} auth account(s).`)

function throwIf(error, label) {
  if (error) {
    throw new Error(`${label}: ${error.message}`)
  }
}

async function loadDotEnv() {
  try {
    const text = await fs.readFile('.env', 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separator = trimmed.indexOf('=')
      if (separator === -1) continue
      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '')
      if (key && process.env[key] === undefined) process.env[key] = value
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
