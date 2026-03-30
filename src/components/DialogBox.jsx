import '../styles/DialogBox.css'

export default function DialogBox({ character, message, grammar, translation, example, onNext, isLastScene }) {
  return (
    <div className="dialog-box">
      <div className="dialog-character">
        <div className="character-avatar">👤</div>
        <h3 className="character-name">{character}</h3>
      </div>

      <div className="dialog-message">
        <p className="message-text">{message}</p>
      </div>

      <div className="dialog-info">
        {translation && (
          <div className="info-row">
            <span className="info-label">🌐 Translation:</span>
            <p className="info-text">{translation}</p>
          </div>
        )}
        
        {example && (
          <div className="info-row">
            <span className="info-label">📝 Examples:</span>
            <p className="info-text">{example}</p>
          </div>
        )}
      </div>

      <button className="btn-next" onClick={onNext}>
        {isLastScene ? 'Hoàn Thành ✓' : 'Tiếp Theo →'}
      </button>
    </div>
  )
}
