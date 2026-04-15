import { useMemo, useState } from 'react'

const normalize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

export default function DictationGame({ text, hint, onComplete, disabled }) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const target = useMemo(() => `${text || ''}`.trim(), [text])

  const playAudio = () => {
    if (disabled || !target || typeof window === 'undefined' || !window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(target)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const submit = (e) => {
    e.preventDefault()
    if (submitted || disabled) return
    const correct = normalize(value) === normalize(target)
    setSubmitted(true)
    onComplete({
      success: correct,
      message: correct ? 'Bạn nghe và chép rất chính xác.' : `Bản gốc: ${target}`
    })
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={playAudio} disabled={disabled} className="submit-btn">
          🔊 Phát audio
        </button>
        {hint ? <span style={{ opacity: 0.8 }}>Gợi ý: {hint}</span> : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nghe rồi gõ lại nội dung..."
        rows={4}
        disabled={disabled || submitted}
        style={{ width: '100%', borderRadius: 10, padding: 10, resize: 'vertical' }}
      />
      <button type="submit" className="submit-btn" disabled={disabled || submitted || !value.trim()}>
        Kiểm tra chính tả
      </button>
    </form>
  )
}
