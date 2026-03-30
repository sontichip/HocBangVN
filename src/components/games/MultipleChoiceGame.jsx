import '../../styles/games/MultipleChoiceGame.css'

export default function MultipleChoiceGame({ question, options, answerIndex, onComplete, disabled }) {
  const handlePick = (index) => {
    if (disabled) return
    onComplete({
      success: index === answerIndex,
      message: index === answerIndex ? 'Chính xác!' : 'Chưa đúng, thử lại lần sau nhé.'
    })
  }

  return (
    <div className="multiple-choice-game">
      <p className="mc-question">{question}</p>
      <div className="mc-options">
        {options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            className="mc-option"
            onClick={() => handlePick(index)}
            disabled={disabled}
          >
            <span className="mc-badge">{String.fromCharCode(65 + index)}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
