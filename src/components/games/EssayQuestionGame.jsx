import { useState } from 'react'

const API_BASE = 'http://localhost:5174'

export default function EssayQuestionGame({ prompt, rubric, token, onComplete, disabled }) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (disabled || loading || !answer.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/grade-essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt, answer: answer.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chấm điểm thất bại')
      setResult(data)
      onComplete({
        success: Number(data.score) >= 6,
        message: `Điểm: ${data.score}/10`
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
      <p style={{ margin: 0 }}>{prompt}</p>
      {rubric ? <p style={{ margin: 0, opacity: 0.8 }}>Tiêu chí: {rubric}</p> : null}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={6}
        placeholder="Nhập câu trả lời tự luận của bạn..."
        disabled={disabled || loading || !!result}
        style={{ width: '100%', borderRadius: 10, padding: 10, resize: 'vertical' }}
      />
      <button className="submit-btn" type="submit" disabled={disabled || loading || !answer.trim() || !!result}>
        {loading ? 'Đang chấm với Gemini...' : 'Nộp bài tự luận'}
      </button>
      {error ? <div style={{ color: '#ff6b6b' }}>{error}</div> : null}
      {result ? (
        <div style={{ background: 'rgba(15,23,42,0.4)', padding: 10, borderRadius: 10 }}>
          <p><strong>Điểm:</strong> {result.score}/10</p>
          <p><strong>Nhận xét:</strong> {result.feedback}</p>
          {result.correctedAnswer ? <p><strong>Bản sửa:</strong> {result.correctedAnswer}</p> : null}
          {Array.isArray(result.grammarTips) && result.grammarTips.length ? (
            <ul>
              {result.grammarTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
