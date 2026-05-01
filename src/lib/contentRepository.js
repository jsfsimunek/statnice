import { isSupabaseConfigured, supabase } from './supabaseClient.js'
import { getSubject } from '../config/subjects.js'

export async function getTopic(subjectSlug, topicNumber) {
  if (await shouldUseStaticContent()) {
    return getStaticTopic(subjectSlug, topicNumber)
  }

  const { data, error } = await supabase
    .from('topic_payloads')
    .select('payload')
    .eq('subject_slug', subjectSlug)
    .eq('topic_number', topicNumber)
    .single()

  if (error) {
    throw error
  }

  return normalizeTopicPayload(data.payload)
}

export async function getTopics(subjectSlug) {
  if (await shouldUseStaticContent()) {
    return getStaticTopics(subjectSlug)
  }

  const { data, error } = await supabase
    .from('topic_payloads')
    .select('payload')
    .eq('subject_slug', subjectSlug)
    .order('topic_number', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(row => normalizeTopicPayload(row.payload))
}

export async function saveTopic(subjectSlug, topicPayload) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.rpc('replace_topic_from_payload', {
    subject_slug: subjectSlug,
    topic_payload: topicPayload,
  })

  if (error) {
    throw error
  }
}

async function getStaticTopic(subjectSlug, topicNumber) {
  const subject = getSubject(subjectSlug)

  if (!subject.staticDataPrefix) {
    throw new Error('not found')
  }

  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}data/${subject.staticDataPrefix}${topicNumber}.json`)

  if (!res.ok) {
    throw new Error('not found')
  }

  return normalizeTopicPayload(await res.json())
}

async function getStaticTopics(subjectSlug) {
  const subject = getSubject(subjectSlug)
  const topics = await Promise.all(
    Array.from({ length: subject.topicCount }, (_, index) => index + 1)
      .map(topicNumber => getStaticTopic(subjectSlug, topicNumber).catch(() => null))
  )

  return topics.filter(Boolean)
}

async function shouldUseStaticContent() {
  if (!isSupabaseConfigured) {
    return true
  }

  const { data } = await supabase.auth.getSession()
  return !data.session?.user
}

function normalizeTopicPayload(payload) {
  return {
    ...payload,
    podotazky: payload.podotazky ?? payload.subquestions ?? [],
  }
}
