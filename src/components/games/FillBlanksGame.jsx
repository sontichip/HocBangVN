import { useState } from 'react'
import '../../styles/games/FillBlanksGame.css'

export default function FillBlanksGame({ question, answer, onComplete, disabled }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitted) return
    setSubmitted(true)
    const isCorrect = input.trim().toLowerCase() === answer.trim().toLowerCase()
    onComplete({
      success: isCorrect,
      message: isCorrect ? 'Điền đúng rồi!' : `Đáp án đúng: ${answer}`
    })
  }

  return (
    <form className="fill-blanks-game" onSubmit={handleSubmit}>
      <div className="blank-display">
        <p className="blank-sentence">
          {question.split('___').map((part, index) => (
            <span key={index}>
              {part}
              {index < question.split('___').length - 1 && (
                <input
                  type="text"
                  value={input}
                  onChange={handleChange}
                  disabled={disabled || submitted}
                  className="blank-input"
                  autoFocus
                />
              )}
            </span>
          ))}
        </p>
      </div>
      <button type="submit" className="submit-btn" disabled={disabled || submitted || !input.trim()}>
        Kiểm tra
      </button>
    </form>
  )
}
