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

    const pair = pairs.find(p => p.left === selectedLeft && p.right === rightValue)
    
    if (matches.some(m => m.left === selectedLeft && m.right === rightValue)) {
      return
    }

    setMatches([...matches, { left: selectedLeft, right: rightValue, correct: pair?.correct || false }])
    setSelectedLeft(null)

    if (matches.length + 1 === pairs.length) {
      const allCorrect = [...matches, { correct: pair?.correct || false }].every(m => m.correct)
      onComplete({
        success: allCorrect,
        message: allCorrect ? 'Bạn ghép đúng tất cả!' : 'Một số ghép chưa đúng.'
      })
    }
  }

  const matchedLefts = matches.map(m => m.left)
  const matchedRights = matches.map(m => m.right)
  const lefts = [...new Set(pairs.map(p => p.left))]
  const rights = [...new Set(pairs.map(p => p.right))]

  return (
    <div className="word-match-game">
      <div className="match-columns">
        <div className="match-column left">
          {lefts.map(left => (
            <button
              key={left}
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
          {rights.map(right => (
            <button
              key={right}
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
        <p>Matching: {matches.length}/{pairs.length}</p>
      </div>
    </div>
  )
}
