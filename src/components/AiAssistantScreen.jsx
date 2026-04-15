import React, { useState } from 'react'

const PHP_API_URL = 'http://localhost:8000/index.php'

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
      // Network failures throw before we get here; res may be undefined on network error
      if (!res) throw new Error('Network error')
      let data
      try {
        data = await res.json()
      } catch (parseErr) {
        data = null
      }
      if (!res.ok) {
        const serverMsg = (data && (data.error || data.message)) || res.statusText || 'AI request failed'
        throw new Error(serverMsg)
      }
      setAnswer((data && (data.answer || data.result || JSON.stringify(data))) || 'No answer')
    } catch (e) {
      const msg = (e && e.message) ? e.message : String(e)
      const userMsg = msg.includes('Failed to fetch') || msg.includes('Network') || msg === 'Network error'
        ? 'Không thể kết nối tới AI backend. Hãy đảm bảo backend PHP đang chạy tại http://localhost:8000 và cho phép CORS. Nhấn Thử lại khi đã khởi động backend.'
        : msg
      setError(userMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 14, fontFamily: 'Inter, system-ui, sans-serif', color: '#083325' }}>
      <button onClick={onBack} style={{ marginBottom: 10, background: 'transparent', border: 'none', color: '#0b6b3a', fontSize: 14 }}>⬅</button>
      <h2 style={{ margin: '6px 0', color: '#0b6b3a' }}>Trợ lý AI</h2>
      <p style={{ marginTop: 0, marginBottom: 10, color: '#145c44', fontSize: 13 }}>Hỏi ngắn — trả lời ngắn.</p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ví dụ: Explain present perfect"
        rows={5}
        style={{ width: '100%', maxWidth: 700, padding: 10, borderRadius: 8, border: '1px solid #cfeee1', fontSize: 13 }}
      />

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={askAi}
          disabled={loading || !question.trim()}
          style={{
            background: 'linear-gradient(90deg,#66bb6a,#2e7d32)',
            color: '#ffffff',
            border: 'none',
            padding: '6px 10px',
            borderRadius: 8,
            cursor: loading ? 'default' : 'pointer',
            fontSize: 13,
            minWidth: 72
          }}
        >
          {loading ? 'Đang...' : 'Gửi'}
        </button>
        {error && (
          <div style={{ marginTop: 0 }}>
            <p style={{ color: '#b00020', margin: 0, fontSize: 13 }}>{error}</p>
            <button onClick={askAi} style={{ marginTop: 6, background: '#ffffff', borderRadius: 8, padding: '6px 8px', border: '1px solid #cfeee1', color: '#0b6b3a', fontSize: 12 }}>Lại</button>
          </div>
        )}
      </div>

      {answer && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0', color: '#0b6b3a', fontSize: 15 }}>Phản hồi</h3>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 420, fontSize: 13, background: '#f4fff7', padding: 10, borderRadius: 8 }}>{answer}</pre>
        </div>
      )}
    </div>
  )
}
