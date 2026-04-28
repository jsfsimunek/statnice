import fs from 'node:fs/promises'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

await loadDotEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const importFile = process.env.CONTENT_IMPORT_FILE ?? process.argv[2]

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

if (!importFile) {
  console.error('Missing import file. Set CONTENT_IMPORT_FILE or pass a file path.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const raw = await fs.readFile(importFile, 'utf8')
const data = JSON.parse(raw)

for (const [subjectIndex, subject] of (data.subjects ?? []).entries()) {
  const { data: subjectRow, error: subjectError } = await supabase
    .from('subjects')
    .upsert({
      slug: subject.slug,
      name: subject.name,
      description: subject.description ?? null,
      order_index: subject.orderIndex ?? subjectIndex + 1,
    }, { onConflict: 'slug' })
    .select('id')
    .single()

  throwIf(subjectError, `subject ${subject.slug}`)

  for (const [topicIndex, topic] of (subject.topics ?? []).entries()) {
    const { data: topicRow, error: topicError } = await supabase
      .from('topics')
      .upsert({
        subject_id: subjectRow.id,
        number: topic.number,
        title: topic.title,
        description: topic.description ?? null,
        order_index: topic.orderIndex ?? topicIndex + 1,
        published: topic.published ?? true,
      }, { onConflict: 'subject_id,number' })
      .select('id')
      .single()

    throwIf(topicError, `topic ${subject.slug}/${topic.number}`)
    await replaceTopicChildren(topicRow.id, topic)
  }
}

console.log(`Imported ${data.subjects?.length ?? 0} subjects from ${importFile}.`)

async function replaceTopicChildren(topicId, topic) {
  const { error: deleteError } = await supabase
    .from('subquestions')
    .delete()
    .eq('topic_id', topicId)

  throwIf(deleteError, `delete subquestions for topic ${topic.number}`)

  for (const [subIndex, subquestion] of (topic.subquestions ?? topic.podotazky ?? []).entries()) {
    const { data: subRow, error: subError } = await supabase
      .from('subquestions')
      .insert({
        topic_id: topicId,
        letter: subquestion.letter ?? subquestion.pismeno,
        prompt: subquestion.prompt ?? subquestion.zneni,
        order_index: subquestion.orderIndex ?? subIndex + 1,
      })
      .select('id')
      .single()

    throwIf(subError, `subquestion ${topic.number}${subquestion.letter ?? subquestion.pismeno}`)

    await insertStudy(subRow.id, subquestion.study ?? subquestion.studium)
    await insertFlashcards(subRow.id, subquestion.flashcards)
    await insertQuiz(subRow.id, subquestion.quiz ?? subquestion.kviz)
  }
}

async function insertStudy(subquestionId, study = {}) {
  for (const [sectionIndex, section] of (study.sections ?? study.sekce ?? []).entries()) {
    const { data: sectionRow, error: sectionError } = await supabase
      .from('study_sections')
      .insert({
        subquestion_id: subquestionId,
        title: section.title ?? section.nadpis ?? null,
        content: section.content ?? section.obsah ?? null,
        list_items: section.list ?? section.seznam ?? [],
        mnemonic: section.mnemonic ?? section.mnemotechnika ?? null,
        order_index: section.orderIndex ?? sectionIndex + 1,
      })
      .select('id')
      .single()

    throwIf(sectionError, `study section ${sectionIndex + 1}`)

    const tables = Array.isArray(section.tables)
      ? section.tables
      : Array.isArray(section.tabulka)
        ? section.tabulka
        : section.tabulka
          ? [section.tabulka]
          : []

    for (const [tableIndex, table] of tables.entries()) {
      const { error } = await supabase.from('section_tables').insert({
        section_id: sectionRow.id,
        columns: table.columns ?? table.sloupce ?? [],
        rows: table.rows ?? table.radky ?? [],
        order_index: tableIndex + 1,
      })

      throwIf(error, `table ${tableIndex + 1}`)
    }

    for (const [imageIndex, image] of (section.images ?? section.obrazky ?? []).entries()) {
      const { error } = await supabase.from('section_images').insert({
        section_id: sectionRow.id,
        src: image.src,
        caption: image.caption ?? image.popis ?? null,
        order_index: imageIndex + 1,
      })

      throwIf(error, `image ${imageIndex + 1}`)
    }
  }

  for (const [itemIndex, item] of (study.examChecklist ?? study.exam_checklist ?? []).entries()) {
    const { error } = await supabase.from('exam_checklist_items').insert({
      subquestion_id: subquestionId,
      text: item,
      order_index: itemIndex + 1,
    })

    throwIf(error, `checklist item ${itemIndex + 1}`)
  }
}

async function insertFlashcards(subquestionId, flashcards = []) {
  for (const [cardIndex, card] of flashcards.entries()) {
    const { error } = await supabase.from('flashcards').insert({
      subquestion_id: subquestionId,
      question: card.question ?? card.otazka,
      answer: card.answer ?? card.odpoved,
      order_index: cardIndex + 1,
    })

    throwIf(error, `flashcard ${cardIndex + 1}`)
  }
}

async function insertQuiz(subquestionId, quiz = []) {
  for (const [questionIndex, question] of quiz.entries()) {
    const { data: questionRow, error: questionError } = await supabase
      .from('quiz_questions')
      .insert({
        subquestion_id: subquestionId,
        question: question.question ?? question.otazka,
        explanation: question.explanation ?? question.vysvetleni ?? null,
        correct_option_index: normalizeCorrectAnswer(question.correct ?? question.spravna ?? 0),
        order_index: questionIndex + 1,
      })
      .select('id')
      .single()

    throwIf(questionError, `quiz question ${questionIndex + 1}`)

    for (const [optionIndex, option] of (question.options ?? question.moznosti ?? []).entries()) {
      const { error } = await supabase.from('quiz_options').insert({
        quiz_question_id: questionRow.id,
        text: option,
        option_index: optionIndex,
      })

      throwIf(error, `quiz option ${optionIndex + 1}`)
    }
  }
}

function throwIf(error, label) {
  if (error) {
    throw new Error(`${label}: ${error.message}`)
  }
}

function normalizeCorrectAnswer(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (/^\d+$/.test(trimmed)) return Number(trimmed)
    if (/^[A-Z]$/i.test(trimmed)) return trimmed.toUpperCase().charCodeAt(0) - 65
  }

  return 0
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
