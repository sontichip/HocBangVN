import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ensure uploads and user_lessons folders exist
const uploadsDir = path.join(__dirname, 'uploads')
const userLessonsDir = path.join(__dirname, 'user_lessons')
try { fs.mkdirSync(uploadsDir, { recursive: true }) } catch (e) {}
try { fs.mkdirSync(userLessonsDir, { recursive: true }) } catch (e) {}

const upload = multer({ dest: uploadsDir })
const app = express()
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(express.json())

const defaultActivities = [
  {
    type: 'multipleChoice',
    title: 'Flashcard trắc nghiệm',
    question: 'Chọn nghĩa đúng của từ "learn".',
    options: ['học', 'ăn', 'ngủ', 'chạy'],
    answerIndex: 0
  },
  {
    type: 'fillBlanks',
    title: 'Điền vào chỗ trống',
    question: 'I ____ English every day.',
    answer: 'study'
  },
  {
    type: 'wordMatch',
    title: 'Ghép nối từ và nghĩa',
    pairs: [
      { a: 'book', b: 'quyển sách' },
      { a: 'teacher', b: 'giáo viên' }
    ]
  },
  {
    type: 'sentenceBuilder',
    title: 'Sắp xếp câu',
    words: ['I', 'am', 'learning', 'English'],
    answer: 'I am learning English'
  },
  {
    type: 'dictation',
    title: 'Nghe chép chính tả',
    text: 'Learning English takes practice every day.'
  },
  {
    type: 'spacedRepetition',
    title: 'Thẻ ghi nhớ thông minh',
    cards: [
      { front: 'apple', back: 'quả táo' },
      { front: 'library', back: 'thư viện' }
    ]
  },
  {
    type: 'essay',
    title: 'Hỏi đáp tự luận',
    prompt: 'Viết 3-5 câu giới thiệu thói quen học tiếng Anh của bạn.'
  }
]

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : '')

function extractFirstTextPart(json) {
  try {
    const parts = json?.candidates?.[0]?.content?.parts || []
    const textPart = parts.find((part) => typeof part.text === 'string' && part.text.trim())
    return textPart?.text || ''
  } catch {
    return ''
  }
}

function parsePotentialJson(input) {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidates = fenced ? [fenced[1], trimmed] : [trimmed]
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {}
  }
  return null
}

function normalizePairs(rawPairs) {
  if (!Array.isArray(rawPairs)) return []
  return rawPairs
    .map((pair) => {
      if (!pair || typeof pair !== 'object') return null
      const left = sanitizeText(pair.a || pair.left || pair.front || pair.term)
      const right = sanitizeText(pair.b || pair.right || pair.back || pair.definition)
      if (!left || !right) return null
      return { a: left, b: right, image: sanitizeText(pair.image) || null }
    })
    .filter(Boolean)
}

function normalizeActivity(item) {
  if (!item || typeof item !== 'object') return null
  const type = sanitizeText(item.type)
  const title = sanitizeText(item.title)
  if (!type) return null

  if (type === 'multipleChoice') {
    const options = Array.isArray(item.options) ? item.options.map((o) => `${o}`) : []
    const answerIndex = Number.isInteger(item.answerIndex) ? item.answerIndex : 0
    if (!item.question || options.length < 2) return null
    return { type, title, question: `${item.question}`, options, answerIndex: Math.max(0, Math.min(answerIndex, options.length - 1)) }
  }
  if (type === 'fillBlanks') {
    const question = sanitizeText(item.question)
    const answer = sanitizeText(item.answer)
    if (!question || !answer) return null
    return { type, title, question, answer }
  }
  if (type === 'wordMatch') {
    const pairs = normalizePairs(item.pairs)
    if (!pairs.length) return null
    return { type, title, pairs }
  }
  if (type === 'sentenceBuilder') {
    const answer = sanitizeText(item.answer || item.sentence)
    const words = Array.isArray(item.words) ? item.words.map((w) => `${w}`) : answer.split(/\s+/).filter(Boolean)
    if (!answer || !words.length) return null
    return { type, title, words, answer }
  }
  if (type === 'dictation') {
    const text = sanitizeText(item.text || item.script)
    if (!text) return null
    return { type, title, text, hint: sanitizeText(item.hint) }
  }
  if (type === 'spacedRepetition') {
    const cards = Array.isArray(item.cards)
      ? item.cards
          .map((card) => {
            const front = sanitizeText(card?.front || card?.term || card?.question)
            const back = sanitizeText(card?.back || card?.definition || card?.answer)
            return front && back ? { front, back } : null
          })
          .filter(Boolean)
      : []
    if (!cards.length) return null
    return { type, title, cards }
  }
  if (type === 'essay') {
    const prompt = sanitizeText(item.prompt || item.question)
    if (!prompt) return null
    return { type, title, prompt, rubric: sanitizeText(item.rubric) }
  }

  return null
}

function normalizeGeneratedPayload(payload) {
  if (!payload || typeof payload !== 'object') return null
  const activities = Array.isArray(payload.activities)
    ? payload.activities.map(normalizeActivity).filter(Boolean)
    : []

  return {
    title: sanitizeText(payload.title) || 'Bài học cá nhân hoá',
    description: sanitizeText(payload.description) || 'Bài học được tạo từ tài liệu người dùng.',
    activities: activities.length ? activities : defaultActivities
  }
}

async function gradeEssayWithGemini({ prompt, answer }) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  const GOOGLE_ENDPOINT =
    process.env.GOOGLE_ENDPOINT ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'
  if (!GOOGLE_API_KEY) return null

  const gradingPrompt = `Bạn là giáo viên tiếng Anh. Hãy chấm câu trả lời của học viên theo thang 0-10.\nTrả về đúng JSON với schema: {"score":number,"feedback":"...","correctedAnswer":"...","grammarTips":["..."]}\nĐề bài: ${prompt}\nBài làm: ${answer}`
  const body = {
    contents: [{ parts: [{ text: gradingPrompt }] }],
    generationConfig: { temperature: 0.2 }
  }
  const resp = await fetch(GOOGLE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GOOGLE_API_KEY },
    body: JSON.stringify(body)
  })
  const raw = await resp.json()
  const text = extractFirstTextPart(raw)
  const parsed = parsePotentialJson(text)
  if (!parsed || typeof parsed !== 'object') return null
  return {
    score: Number(parsed.score) || 0,
    feedback: sanitizeText(parsed.feedback) || 'AI đã chấm bài.',
    correctedAnswer: sanitizeText(parsed.correctedAnswer),
    grammarTips: Array.isArray(parsed.grammarTips) ? parsed.grammarTips.map((item) => `${item}`) : []
  }
}

// Simple in-memory token->username map (for demo only)
const tokens = new Map()

// POST /api/process - accepts a user file, sends to Gemini (if configured), returns lesson JSON
app.post('/api/process', upload.single('file'), async (req, res) => {
  try {
    // authenticate
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/, '')
    const username = tokens.get(token)
    if (!username) return res.status(401).json({ error: 'Unauthorized' })

    const file = req.file
    if (!file) return res.status(400).json({ error: 'No file' })

    // read file text (best-effort)
    let text = ''
    try {
      text = fs.readFileSync(file.path, 'utf8').slice(0, 20000)
    } catch (e) {
      text = `Uploaded file: ${file.originalname}`
    }

      // Call model if configured via env
      let generated = null
      try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
        const GOOGLE_ENDPOINT = process.env.GOOGLE_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent'
        const GEMINI_ENDPOINT = process.env.GEMINI_ENDPOINT
        // Prefer Google Generative Language API if key present
        if (GOOGLE_API_KEY) {
          const prompt = `Bạn hãy chuyển tài liệu sau thành JSON bài học tiếng Anh cho app học tập.\nYêu cầu: chỉ trả về JSON hợp lệ theo schema sau:\n{\n  "title":"string",\n  "description":"string",\n  "activities":[\n    {"type":"multipleChoice","title":"string","question":"string","options":["..."],"answerIndex":0},\n    {"type":"fillBlanks","title":"string","question":"Câu có ____","answer":"string"},\n    {"type":"wordMatch","title":"string","pairs":[{"a":"từ","b":"nghĩa","image":"url hoặc rỗng"}]},\n    {"type":"sentenceBuilder","title":"string","words":["..."],"answer":"string"},\n    {"type":"dictation","title":"string","text":"string","hint":"string"},\n    {"type":"spacedRepetition","title":"string","cards":[{"front":"string","back":"string"}]},\n    {"type":"essay","title":"string","prompt":"string","rubric":"string"}\n  ]\n}\nMỗi type xuất hiện ít nhất 1 lần.\n---\n${text}`
          const body = {
            contents: [
              {
                parts: [
                { text: prompt }
              ]
            }
          ]
        }
        const resp = await fetch(GOOGLE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GOOGLE_API_KEY },
          body: JSON.stringify(body)
          })
          const json = await resp.json()
          const parsed = parsePotentialJson(extractFirstTextPart(json))
          generated = normalizeGeneratedPayload(parsed) || { raw: json }
        } else if (GEMINI_ENDPOINT && process.env.GEMINI_API_KEY) {
          // legacy/custom endpoint with Bearer token
          const prompt = `Convert the following document to valid JSON with title, description, and activities for: multipleChoice, fillBlanks, wordMatch, sentenceBuilder, dictation, spacedRepetition, essay.\n---\n${text}`
          const resp = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` },
            body: JSON.stringify({ prompt, max_tokens: 8000 })
          })
          const body = await resp.text()
          const parsed = parsePotentialJson(body)
          generated = normalizeGeneratedPayload(parsed) || { raw: body }
        }
      } catch (e) {
        console.error('Model call failed', e)
      }

      const lesson = {
        id: uuidv4(),
        title: `Lesson from ${file.originalname}`,
        sourcePreview: text.slice(0, 1000),
        generated: normalizeGeneratedPayload(generated) || {
          title: `Personalized lesson: ${file.originalname}`,
          description: 'Bộ bài tập cá nhân hoá được tạo tự động từ tài liệu tải lên.',
          activities: defaultActivities
        }
      }

    // remove uploaded file to save space
    try { fs.unlinkSync(file.path) } catch (e) {}

    // save lesson to user folder
    try {
      const userDir = path.join(userLessonsDir, username)
      fs.mkdirSync(userDir, { recursive: true })
      const outPath = path.join(userDir, `${lesson.id}.json`)
      fs.writeFileSync(outPath, JSON.stringify(lesson, null, 2))
    } catch (e) { console.error('save failed', e) }

    res.json(lesson)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/grade-essay', async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/, '')
    const username = tokens.get(token)
    if (!username) return res.status(401).json({ error: 'Unauthorized' })

    const prompt = sanitizeText(req.body?.prompt)
    const answer = sanitizeText(req.body?.answer)
    if (!prompt || !answer) {
      return res.status(400).json({ error: 'prompt and answer are required' })
    }

    let grade = null
    try {
      grade = await gradeEssayWithGemini({ prompt, answer })
    } catch (error) {
      console.error('Essay grading failed via Gemini', error)
    }

    if (!grade) {
      const lengthScore = Math.min(10, Math.max(4, Math.round(answer.split(/\s+/).filter(Boolean).length / 6)))
      grade = {
        score: lengthScore,
        feedback: 'Chưa có API Gemini nên hệ thống chấm tạm theo độ dài và đưa phản hồi cơ bản.',
        correctedAnswer: answer,
        grammarTips: [
          'Kiểm tra chia động từ theo thì.',
          'Thêm dấu câu ở cuối mỗi câu.',
          'Ưu tiên câu ngắn, rõ nghĩa.'
        ]
      }
    }

    res.json({ ...grade, gradedBy: grade.feedback.includes('Gemini') ? 'gemini' : 'fallback', username })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// simple login: POST /api/login { username }
app.post('/api/login', (req, res) => {
  const username = req.body.username
  if (!username) return res.status(400).json({ error: 'username required' })
  const token = uuidv4()
  tokens.set(token, username)
  // ensure user folder
  try { fs.mkdirSync(path.join(userLessonsDir, username), { recursive: true }) } catch (e) {}
  res.json({ token, username })
})

// list lessons for authenticated user
app.get('/api/lessons', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const username = tokens.get(token)
  if (!username) return res.status(401).json({ error: 'Unauthorized' })
  const userDir = path.join(userLessonsDir, username)
  try {
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.json'))
    const list = files.map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(userDir, f), 'utf8')) } catch { return null }
    }).filter(Boolean)
    res.json(list)
  } catch (e) { res.json([]) }
})

// get single lesson
app.get('/api/lessons/:id', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const username = tokens.get(token)
  if (!username) return res.status(401).json({ error: 'Unauthorized' })
  const id = req.params.id
  const p = path.join(userLessonsDir, username, `${id}.json`)
  if (!fs.existsSync(p)) return res.status(404).json({ error: 'Not found' })
  res.json(JSON.parse(fs.readFileSync(p, 'utf8')))
})

const port = process.env.PORT || 5174
app.listen(port, () => console.log('Processing server running on', port))
