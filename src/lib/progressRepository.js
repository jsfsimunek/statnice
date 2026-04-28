import { isSupabaseConfigured, supabase } from './supabaseClient.js'

export const EMPTY_PROGRESS = {
  checklistDone: [],
  flashcardsDone: [],
  quizResults: [],
  notes: '',
}

export async function loadProgress(progressKey) {
  if (!isSupabaseConfigured) {
    return loadLocalProgress(progressKey)
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id

  if (!userId) {
    return EMPTY_PROGRESS
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('checklist_done, flashcards_done, quiz_results, notes')
    .eq('user_id', userId)
    .eq('progress_key', progressKey)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return EMPTY_PROGRESS
  }

  return {
    checklistDone: data.checklist_done ?? [],
    flashcardsDone: data.flashcards_done ?? [],
    quizResults: data.quiz_results ?? [],
    notes: data.notes ?? '',
  }
}

export async function saveProgress(progressKey, progress) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(localStorageKey(progressKey), JSON.stringify(progress))
    return
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id

  if (!userId) {
    return
  }

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      progress_key: progressKey,
      checklist_done: progress.checklistDone ?? [],
      flashcards_done: progress.flashcardsDone ?? [],
      quiz_results: progress.quizResults ?? [],
      notes: progress.notes ?? '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,progress_key' })

  if (error) {
    throw error
  }
}

function loadLocalProgress(progressKey) {
  try {
    return {
      ...EMPTY_PROGRESS,
      ...JSON.parse(localStorage.getItem(localStorageKey(progressKey)) ?? '{}'),
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

function localStorageKey(progressKey) {
  return `progress:${progressKey}`
}
