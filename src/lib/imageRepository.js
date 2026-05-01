import { isSupabaseConfigured, supabase } from './supabaseClient.js'

const CONTENT_IMAGE_BUCKET = 'content-images'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export async function uploadContentImage(file, context) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase není nastavené.')
  }

  if (!file) {
    throw new Error('Vyber obrázek k nahrání.')
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Podporované formáty jsou JPG, PNG, WebP, GIF a SVG.')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Obrázek je moc velký. Limit v editoru je 5 MB.')
  }

  const path = buildImagePath(file, context)
  const { error } = await supabase.storage
    .from(CONTENT_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    if (error.message?.includes('row-level security')) {
      throw new Error('Supabase Storage blokuje upload. Spusť migraci 20260501120000_content_image_storage.sql.')
    }

    throw error
  }

  const { data } = supabase.storage
    .from(CONTENT_IMAGE_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

function buildImagePath(file, context = {}) {
  const extension = getExtension(file)
  const safeName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'obrazek'
  const subject = slugify(context.subjectSlug) || 'subject'
  const topic = `okruh-${context.topicNumber || 'x'}`
  const subquestion = slugify(context.subquestionLetter) || 'podotazka'
  const section = `sekce-${Number(context.sectionIndex ?? 0) + 1}`
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return [subject, topic, subquestion, section, `${stamp}-${safeName}.${extension}`].join('/')
}

function getExtension(file) {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName

  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  }[file.type] ?? 'png'
}

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
