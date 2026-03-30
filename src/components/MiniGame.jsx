import { useState } from 'react'
import MultipleChoiceGame from './games/MultipleChoiceGame'
import WordMatchGame from './games/WordMatchGame'
import SentenceBuilderGame from './games/SentenceBuilderGame'
import FillBlanksGame from './games/FillBlanksGame'
import '../styles/MiniGame.css'

export default function MiniGame({ game, onComplete }) {
  const [feedback, setFeedback] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const handleGameComplete = (result) => {
    setFeedback(result)
    setIsAnswered(true)
    setTimeout(() => {
      onComplete(result.success)
    }, 1200)
  }

  return (
    <div className="mini-game-container">
      <div className="game-header">
        <h3 className="game-title">🎮 {game.title || ''}</h3>
        <p className="game-question">{game.question || ''}</p>
      </div>
      <div className="game-content">
        {game.type === 'multipleChoice' && (
          <MultipleChoiceGame
            question={game.question}
            options={game.options}
            answerIndex={game.answerIndex}
            onComplete={handleGameComplete}
            disabled={isAnswered}
          />
        )}
        {game.type === 'wordMatch' && (
          <WordMatchGame
            pairs={game.pairs}
            onComplete={handleGameComplete}
            disabled={isAnswered}
          />
        )}
        {game.type === 'sentenceBuilder' && (
          <SentenceBuilderGame
            sentence={game.answer}
            words={game.words}
            onComplete={handleGameComplete}
            disabled={isAnswered}
          />
        )}
        {game.type === 'fillBlanks' && (
          <FillBlanksGame
            question={game.question}
            answer={game.answer}
            onComplete={handleGameComplete}
            disabled={isAnswered}
          />
        )}
      </div>
      {isAnswered && (
        <div className={`game-feedback ${feedback ? (feedback.success ? 'success' : 'error') : ''}`}>
          <p className="feedback-text">
            {feedback?.success ? '✅ Đúng rồi!' : '❌ Sai rồi, hãy thử lại!'}
          </p>
          {feedback?.message && <p className="feedback-detail">{feedback.message}</p>}
        </div>
      )}
    </div>
  )
}
