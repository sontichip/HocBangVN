import { useState } from 'react'
import '../../styles/games/WordMatchGame.css'

export default function WordMatchGame({ pairs, onComplete, disabled }) {
  const [matches, setMatches] = useState([])
  const [selectedLeft, setSelectedLeft] = useState(null)

  const handleSelectLeft = (leftValue) => {
    if (disabled) return
    setSelectedLeft(selLeft => selLeft === leftValue ? null : leftValue)
  }

  const handleSelectRight = (rightValue) => {
    if (disabled || selectedLeft === null) return

    const pair = pairs.find(p => p.a === selectedLeft && p.b === rightValue)
    if (matches.some(m => m.a === selectedLeft && m.b === rightValue)) {
      return
    }

    const newMatches = [...matches, { a: selectedLeft, b: rightValue, correct: !!pair }]
    setMatches(newMatches)
    setSelectedLeft(null)

    if (newMatches.length === pairs.length) {
      const allCorrect = newMatches.every(m => m.correct)
      onComplete({
        success: allCorrect,
        message: allCorrect ? 'Tuyệt vời, chính xác 100%!' : 'Một số cặp chưa đúng.'
      })
    }
  }

  const matchedLefts = matches.map(m => m.a)
  const matchedRights = matches.map(m => m.b)
  const lefts = [...new Set(pairs.map(p => p.a))]
  const rights = [...new Set(pairs.map(p => p.b))]

  return (
    <div className="word-match-game">
      <div className="match-columns">
        <div className="match-column left">
          {lefts.map((left, idx) => (
            <button
              key={`left-${idx}`}
              className={`match-item ${selectedLeft === left ? 'selected' : ''} ${matchedLefts.includes(left) ? 'matched' : ''}`}
              onClick={() => handleSelectLeft(left)}
              disabled={disabled || matchedLefts.includes(left)}
            >
              {left}
            </button>
          ))}
        </div>

        <div className="match-lines">
          {matches.map((match, idx) => (
            <div key={idx} className={`match-line ${match.correct ? 'correct' : 'incorrect'}`}></div>
          ))}
        </div>

        <div className="match-column right">
          {rights.map((right, idx) => (
            <button
              key={`right-${idx}`}
              className={`match-item ${matchedRights.includes(right) ? 'matched' : ''}`}
              onClick={() => handleSelectRight(right)}
              disabled={disabled || matchedRights.includes(right)}
            >
              {right}
            </button>
          ))}
        </div>
      </div>

      <div className="match-progress">
        <p>Ghép cặp: {matches.length}/{pairs.length}</p>
      </div>
    </div>
  )
}
