import { useMemo, useState } from 'react'
import '../../styles/games/WordMatchGame.css'

export default function WordMatchGame({ pairs, onComplete, disabled }) {
  const [matches, setMatches] = useState([])
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [draggingLeft, setDraggingLeft] = useState(null)

  const normalizedPairs = useMemo(
    () =>
      (pairs || [])
        .map((pair) => {
          const left = pair?.a ?? pair?.left ?? pair?.front ?? pair?.term
          const right = pair?.b ?? pair?.right ?? pair?.back ?? pair?.definition
          return left && right ? { a: `${left}`, b: `${right}` } : null
        })
        .filter(Boolean),
    [pairs]
  )

  const handleSelectLeft = (leftValue) => {
    if (disabled) return
    setSelectedLeft(selLeft => selLeft === leftValue ? null : leftValue)
  }

  const commitMatch = (leftValue, rightValue) => {
    if (disabled || !leftValue || !rightValue) return
    const pair = normalizedPairs.find(p => p.a === leftValue && p.b === rightValue)
    if (matches.some(m => m.a === leftValue && m.b === rightValue)) {
      return
    }
    const newMatches = [...matches, { a: leftValue, b: rightValue, correct: !!pair }]
    setMatches(newMatches)
    setSelectedLeft(null)
    setDraggingLeft(null)

    if (newMatches.length === normalizedPairs.length) {
      const allCorrect = newMatches.every(m => m.correct)
      onComplete({
        success: allCorrect,
        message: allCorrect ? 'Tuyệt vời, chính xác 100%!' : 'Một số cặp chưa đúng.'
      })
    }
  }

  const handleSelectRight = (rightValue) => {
    if (disabled || selectedLeft === null) return
    commitMatch(selectedLeft, rightValue)
  }

  const matchedLefts = matches.map(m => m.a)
  const matchedRights = matches.map(m => m.b)
  const lefts = [...new Set(normalizedPairs.map(p => p.a))]
  const rights = [...new Set(normalizedPairs.map(p => p.b))]

  return (
    <div className="word-match-game">
      <div className="match-columns">
        <div className="match-column left">
          {lefts.map((left, idx) => (
            <button
              key={`left-${idx}`}
                className={`match-item ${selectedLeft === left ? 'selected' : ''} ${matchedLefts.includes(left) ? 'matched' : ''}`}
                onClick={() => handleSelectLeft(left)}
                draggable={!disabled && !matchedLefts.includes(left)}
                onDragStart={() => setDraggingLeft(left)}
                onDragEnd={() => setDraggingLeft(null)}
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
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggingLeft) commitMatch(draggingLeft, right)
                }}
                disabled={disabled || matchedRights.includes(right)}
              >
                {right}
              </button>
          ))}
        </div>
      </div>

      <div className="match-progress">
        <p>Ghép cặp: {matches.length}/{normalizedPairs.length}</p>
      </div>
    </div>
  )
}
