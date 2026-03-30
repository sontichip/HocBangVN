import { useState } from 'react'
import '../../styles/games/SentenceBuilderGame.css'

export default function SentenceBuilderGame({ words, sentence, onComplete, disabled }) {
  const [shuffled] = useState(() => {
    const arr = [...words]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [selected, setSelected] = useState([])
  const [used, setUsed] = useState([])

  const handleSelectWord = (word, index) => {
    if (disabled || used.includes(index)) return
    const newSelected = [...selected, word]
    const newUsed = [...used, index]
    setSelected(newSelected)
    setUsed(newUsed)
    if (newSelected.length === words.length) {
      const isCorrect = newSelected.join(' ') === sentence
      onComplete({
        success: isCorrect,
        message: isCorrect ? 'Sắp xếp đúng rồi!' : 'Sắp xếp lại từ để tạo: ' + sentence
      })
    }
  }

  const handleRemoveWord = (idx) => {
    if (disabled) return
    setSelected(selected.filter((_, i) => i !== idx))
    setUsed(used.filter((_, i) => i !== idx))
  }

  return (
    <div className="sentence-builder-game">
      <div className="builder-display">
        <div className="builder-result">
          {selected.length === 0 ? (
            <p className="placeholder">Chọn từ để xây dựng câu...</p>
          ) : (
            <div className="result-words">
              {selected.map((word, idx) => (
                <button
                  key={idx}
                  className="result-word"
                  onClick={() => handleRemoveWord(idx)}
                  disabled={disabled}
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="builder-progress">
          {selected.length}/{words.length} từ
        </div>
      </div>
      <div className="builder-words">
        {shuffled.map((word, idx) => (
          <button
            key={idx}
            className={`builder-word ${used.includes(idx) ? 'used' : ''}`}
            onClick={() => handleSelectWord(word, idx)}
            disabled={disabled || used.includes(idx)}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}
