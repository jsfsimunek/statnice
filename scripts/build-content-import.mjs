import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const dataDir = path.join(cwd, 'public', 'data')
const outputFile = path.join(cwd, process.argv[2] ?? 'content-import.generated.json')

const files = await fs.readdir(dataDir)
const topicFiles = files
  .map(file => {
    const match = /^okruh(\d+)\.json$/i.exec(file)
    return match ? { file, number: Number(match[1]) } : null
  })
  .filter(Boolean)
  .sort((a, b) => a.number - b.number)

if (topicFiles.length === 0) {
  console.error(`No okruh*.json files found in ${dataDir}`)
  process.exit(1)
}

const topics = []
const warnings = []

for (const topicFile of topicFiles) {
  const fullPath = path.join(dataDir, topicFile.file)
  const raw = await fs.readFile(fullPath, 'utf8')
  const topic = JSON.parse(raw)

  const normalized = normalizeTopic(topic, topicFile.number)
  validateTopic(normalized, topicFile.file, warnings)
  topics.push(normalized)
}

const output = {
  subjects: [
    {
      slug: 'geografie',
      name: 'Geografie',
      description: 'Statnicove okruhy z geografie.',
      topics,
    },
    {
      slug: 'obcanska-vychova',
      name: 'Obcanska vychova',
      description: 'Statnicove okruhy z obcanske vychovy.',
      topics: [],
    },
  ],
}

await fs.writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

const totals = topics.reduce((acc, topic) => {
  acc.subquestions += topic.subquestions.length

  for (const subquestion of topic.subquestions) {
    acc.sections += subquestion.study.sections.length
    acc.flashcards += subquestion.flashcards.length
    acc.quizQuestions += subquestion.quiz.length
  }

  return acc
}, { subquestions: 0, sections: 0, flashcards: 0, quizQuestions: 0 })

console.log(`Wrote ${path.relative(cwd, outputFile)}`)
console.log(`Topics: ${topics.length}`)
console.log(`Subquestions: ${totals.subquestions}`)
console.log(`Study sections: ${totals.sections}`)
console.log(`Flashcards: ${totals.flashcards}`)
console.log(`Quiz questions: ${totals.quizQuestions}`)

if (warnings.length > 0) {
  console.log('')
  console.log('Warnings:')
  for (const warning of warnings) {
    console.log(`- ${warning}`)
  }
}

function normalizeTopic(topic, fallbackNumber) {
  return {
    number: topic.id ?? topic.number ?? fallbackNumber,
    title: topic.nazev ?? topic.title ?? `Okruh ${fallbackNumber}`,
    subquestions: (topic.podotazky ?? topic.subquestions ?? []).map(normalizeSubquestion),
  }
}

function normalizeSubquestion(subquestion) {
  const study = subquestion.studium ?? subquestion.study ?? {}

  return {
    letter: subquestion.pismeno ?? subquestion.letter,
    prompt: subquestion.zneni ?? subquestion.prompt ?? '',
    study: {
      sections: (study.sekce ?? study.sections ?? []).map(normalizeSection),
      examChecklist: study.exam_checklist ?? study.examChecklist ?? [],
    },
    flashcards: (subquestion.flashcards ?? []).map(card => ({
      question: card.otazka ?? card.question ?? '',
      answer: card.odpoved ?? card.answer ?? '',
    })),
    quiz: (subquestion.kviz ?? subquestion.quiz ?? []).map(question => ({
      question: question.otazka ?? question.question ?? '',
      options: question.moznosti ?? question.options ?? [],
      correct: normalizeCorrectAnswer(question.spravna ?? question.correct ?? 0),
      explanation: question.vysvetleni ?? question.explanation ?? '',
    })),
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

function normalizeSection(section) {
  return {
    title: section.nadpis ?? section.title ?? '',
    content: section.obsah ?? section.content ?? '',
    list: section.seznam ?? section.list ?? [],
    mnemonic: section.mnemotechnika ?? section.mnemonic ?? '',
    tables: normalizeTables(section.tabulka ?? section.tables),
    images: (section.obrazky ?? section.images ?? []).map(image => ({
      src: image.src,
      caption: image.popis ?? image.caption ?? '',
    })),
  }
}

function normalizeTables(tables) {
  if (!tables) return []
  const tableList = Array.isArray(tables) ? tables : [tables]

  return tableList.map(table => ({
    columns: table.sloupce ?? table.columns ?? [],
    rows: table.radky ?? table.rows ?? [],
  }))
}

function validateTopic(topic, file, warnings) {
  if (!topic.number) warnings.push(`${file}: missing topic number`)
  if (!topic.title) warnings.push(`${file}: missing topic title`)
  if (topic.subquestions.length === 0) warnings.push(`${file}: no subquestions`)

  for (const subquestion of topic.subquestions) {
    const prefix = `${file} ${subquestion.letter ?? '?'}`
    if (!subquestion.letter) warnings.push(`${prefix}: missing letter`)
    if (!subquestion.prompt) warnings.push(`${prefix}: missing prompt`)

    for (const [index, quizQuestion] of subquestion.quiz.entries()) {
      if (quizQuestion.options.length === 0) warnings.push(`${prefix}: quiz ${index + 1} has no options`)
      if (quizQuestion.correct < 0 || quizQuestion.correct >= quizQuestion.options.length) {
        warnings.push(`${prefix}: quiz ${index + 1} has invalid correct option index`)
      }
    }
  }
}
