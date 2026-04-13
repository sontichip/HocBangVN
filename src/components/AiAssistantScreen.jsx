import React, { useState } from 'react'

const PHP_API_URL = 'http://localhost:8000/api/ask'

export default function AiAssistantScreen({ onBack, username }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const askAi = async () => {
    const text = question.trim()
    if (!text || loading) return
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      const res = await fetch(PHP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, username })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'AI request failed')
      }
      setAnswer(data.answer || 'No answer')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>⬅ Quay lại</button>
      <h2>Trợ lý AI</h2>
      <p>Đặt câu hỏi tiếng Anh và AI sẽ trả lời ngắn gọn, dễ học.</p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ví dụ: Explain present perfect in simple Vietnamese"
        rows={6}
        style={{ width: '100%', maxWidth: 800, padding: 12, borderRadius: 10 }}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={askAi} disabled={loading || !question.trim()}>
          {loading ? 'Đang hỏi AI...' : 'Gửi câu hỏi'}
        </button>
      </div>

      {error && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</p>}

      {answer && (
        <div style={{ marginTop: 20 }}>
          <h3>Phản hồi</h3>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 420 }}>{answer}</pre>
        </div>
      )}
    </div>
  )
}
