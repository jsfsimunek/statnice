import fs from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

await loadDotEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = process.env.CONTENT_IMAGE_BUCKET ?? 'content-images'

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const { data: buckets, error: listError } = await supabase.storage.listBuckets()
throwIf(listError, 'list buckets')

const existing = buckets.find(item => item.id === bucket)

if (existing) {
  const { error } = await supabase.storage.updateBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  })
  throwIf(error, `update bucket ${bucket}`)
  console.log(`Updated bucket ${bucket}.`)
} else {
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  })
  throwIf(error, `create bucket ${bucket}`)
  console.log(`Created bucket ${bucket}.`)
}

console.log('Bucket is ready. Storage RLS policies still need the SQL migration in supabase/migrations/20260501120000_content_image_storage.sql.')

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

      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}
