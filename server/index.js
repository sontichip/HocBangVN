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
        const prompt = `Convert the following document into a JSON lesson object with fields: title, description, questions (array of {q,type,answerExample}).\n---\n${text}`
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
        // try to extract useful text from response
        if (json && json.candidates && json.candidates.length) {
          generated = { raw: json }
        } else {
          generated = { raw: json }
        }
      } else if (GEMINI_ENDPOINT && process.env.GEMINI_API_KEY) {
        // legacy/custom endpoint with Bearer token
        const prompt = `Convert the following document into a JSON lesson object with fields: title, description, questions (array of {q,type,answerExample}).\n---\n${text}`
        const resp = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` },
          body: JSON.stringify({ prompt, max_tokens: 8000 })
        })
        const body = await resp.text()
        try { generated = JSON.parse(body) } catch (e) { generated = { raw: body } }
      }
    } catch (e) {
      console.error('Model call failed', e)
    }

    const lesson = {
      id: uuidv4(),
      title: `Lesson from ${file.originalname}`,
      sourcePreview: text.slice(0, 1000),
      generated: generated || {
        description: 'This is a generated lesson skeleton. Replace with Gemini output.',
        questions: [
          { q: 'Tóm tắt nội dung', type: 'short', guidance: 'Viết 2-3 câu' },
          { q: 'Tìm từ vựng quan trọng', type: 'list' }
        ]
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
