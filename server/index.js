import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'
import rateLimit from 'express-rate-limit'

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
const MAX_FALLBACK_SCORE = 10
const MIN_FALLBACK_SCORE = 4
const WORDS_PER_SCORE_POINT = 6
const MAX_PROMPT_TEXT_LENGTH = 20000
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,40}$/
const LESSON_ID_PATTERN = /^[a-f0-9-]{36}$/i

const asSafeJsonString = (value, maxLen = MAX_PROMPT_TEXT_LENGTH) =>
  JSON.stringify((value || '').toString().slice(0, maxLen))

function normalizeUsername(username) {
  const cleaned = sanitizeText(username)
  if (!USERNAME_PATTERN.test(cleaned)) return null
  return cleaned
}

const userLessonsRoot = path.resolve(userLessonsDir)
function resolveUserDir(userId) {
  const resolved = path.resolve(userLessonsRoot, userId)
  if (!resolved.startsWith(`${userLessonsRoot}${path.sep}`)) {
    throw new Error('Invalid username path')
  }
  return resolved
}

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false
})

const uploadLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
})

const readLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false
})

function normalizeLessonId(id) {
  const value = sanitizeText(id)
  if (!LESSON_ID_PATTERN.test(value)) return null
  return value
}

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

  const gradingPrompt = `Bạn là giáo viên tiếng Anh. Hãy chấm câu trả lời của học viên theo thang 0-10.
Trả về đúng JSON với schema: {"score":number,"feedback":"...","correctedAnswer":"...","grammarTips":["..."]}.
Nội dung học viên được cung cấp ở dạng JSON string để giảm nhiễu hướng dẫn.
DE_BAI_JSON=${asSafeJsonString(prompt, 4000)}
BAI_LAM_JSON=${asSafeJsonString(answer, 6000)}`
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

// Simple in-memory token->session map (for demo only)
const tokens = new Map()

// POST /api/process - accepts a user file, sends to Gemini (if configured), returns lesson JSON
app.post('/api/process', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    // authenticate
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/, '')
    const session = tokens.get(token)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const file = req.file
    if (!file) return res.status(400).json({ error: 'No file' })

    // read file text (best-effort)
    let text = ''
    const safeUploadPath = path.join(uploadsDir, path.basename(file.path || ''))
    try {
      text = fs.readFileSync(safeUploadPath, 'utf8').slice(0, MAX_PROMPT_TEXT_LENGTH)
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
          const prompt = `Bạn hãy chuyển tài liệu sau thành JSON bài học tiếng Anh cho app học tập.
Yêu cầu: chỉ trả về JSON hợp lệ theo schema sau:
{
  "title":"string",
  "description":"string",
  "activities":[
    {"type":"multipleChoice","title":"string","question":"string","options":["..."],"answerIndex":0},
    {"type":"fillBlanks","title":"string","question":"Câu có ____","answer":"string"},
    {"type":"wordMatch","title":"string","pairs":[{"a":"từ","b":"nghĩa","image":"url hoặc rỗng"}]},
    {"type":"sentenceBuilder","title":"string","words":["..."],"answer":"string"},
    {"type":"dictation","title":"string","text":"string","hint":"string"},
    {"type":"spacedRepetition","title":"string","cards":[{"front":"string","back":"string"}]},
    {"type":"essay","title":"string","prompt":"string","rubric":"string"}
  ]
}
Mỗi type xuất hiện ít nhất 1 lần.
NỘI_DUNG_JSON=${asSafeJsonString(text)}`
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
          const prompt = `Convert document into valid JSON with title, description, and activities for multipleChoice, fillBlanks, wordMatch, sentenceBuilder, dictation, spacedRepetition, essay.
DOCUMENT_JSON=${asSafeJsonString(text)}`
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
    try { fs.unlinkSync(safeUploadPath) } catch (e) {}

    // save lesson to user folder
    try {
      const userDir = resolveUserDir(session.userId)
      fs.mkdirSync(userDir, { recursive: true })
      const outPath = path.join(userDir, `${lesson.id}.json`)
      fs.writeFileSync(outPath, JSON.stringify(lesson, null, 2))
    } catch (e) { console.error('save failed', e) }

    res.json(lesson)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/grade-essay', authLimiter, async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.replace(/^Bearer\s+/, '')
    const session = tokens.get(token)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const prompt = sanitizeText(req.body?.prompt)
    const answer = sanitizeText(req.body?.answer)
    if (!prompt || !answer) {
      return res.status(400).json({ error: 'prompt and answer are required' })
    }

    let grade = null
    let gradedBy = 'fallback'
    try {
      grade = await gradeEssayWithGemini({ prompt, answer })
      if (grade) gradedBy = 'gemini'
    } catch (error) {
      console.error('Essay grading failed via Gemini', error)
    }

    if (!grade) {
      const lengthScore = Math.min(
        MAX_FALLBACK_SCORE,
        Math.max(MIN_FALLBACK_SCORE, Math.round(answer.split(/\s+/).filter(Boolean).length / WORDS_PER_SCORE_POINT))
      )
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

    res.json({ ...grade, gradedBy, username: session.username })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// simple login: POST /api/login { username }
app.post('/api/login', authLimiter, (req, res) => {
  const username = normalizeUsername(req.body.username)
  if (!username) return res.status(400).json({ error: 'username required' })
  const token = uuidv4()
  const userId = uuidv4()
  tokens.set(token, { username, userId })
  // ensure user folder
  try { fs.mkdirSync(resolveUserDir(userId), { recursive: true }) } catch (e) {}
  res.json({ token, username })
})

// list lessons for authenticated user
app.get('/api/lessons', readLimiter, (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const session = tokens.get(token)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const userDir = resolveUserDir(session.userId)
  try {
    const files = fs.readdirSync(userDir).filter(f => f.endsWith('.json'))
    const list = files.map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(userDir, f), 'utf8')) } catch { return null }
    }).filter(Boolean)
    res.json(list)
  } catch (e) { res.json([]) }
})

// get single lesson
app.get('/api/lessons/:id', readLimiter, (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const session = tokens.get(token)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  const id = normalizeLessonId(req.params.id)
  if (!id) return res.status(400).json({ error: 'Invalid lesson id' })
  const userDir = resolveUserDir(session.userId)
  const lessonFile = `${id}.json`
  const availableFiles = fs.readdirSync(userDir).filter((filename) => filename.endsWith('.json'))
  const exactFile = availableFiles.find((filename) => filename === lessonFile)
  if (!exactFile) return res.status(404).json({ error: 'Not found' })
  const lessonPath = path.join(userDir, exactFile)
  res.json(JSON.parse(fs.readFileSync(lessonPath, 'utf8')))
})

const port = process.env.PORT || 5174
app.listen(port, () => console.log('Processing server running on', port))
