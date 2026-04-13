import { useState, useEffect, useRef } from 'react'
import '../styles/DialogBox.css'

export default function DialogBox({ character, speakerAvatar, message, children, onNext, isLastScene, textSpeed = 'normal' }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingSoundRef = useRef(null)

  const playTypeSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!typingSoundRef.current) {
        typingSoundRef.current = new AudioContext();
      }
      const ctx = typingSoundRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  useEffect(() => {
    setDisplayedText('')
    setIsTyping(false)
    if (!message) return

    if (textSpeed === 'fast') {
      setDisplayedText(message)
      return
    }

    setIsTyping(true)
    const speedMs = textSpeed === 'slow' ? 60 : 30
    let i = 0
    const timer = setInterval(() => {
      setDisplayedText(message.slice(0, i + 1))
      if (i % 2 === 0) playTypeSound(); // Play sound every other character
      i++
      if (i >= message.length) {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, speedMs)

    return () => clearInterval(timer)
  }, [message, textSpeed])

  const handleSkipText = () => {
    if (displayedText.length < message?.length) {
      setDisplayedText(message)
      setIsTyping(false)
    }
  }

  return (
    <div className="dialog-box true-vn-dialog" onClick={handleSkipText}>
      <div className="dialog-header-area" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', position: 'absolute', top: '-40px', left: '20px' }}>
        {speakerAvatar && (
          <div className={`speaker-avatar-wrapper ${isTyping ? 'avatar-talking' : ''}`} style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #ff9ff3', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 2 }}>
            <img src={speakerAvatar} alt={character} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div className="dialog-character-name-badge" style={{ background: '#3b82f6', padding: '5px 20px', borderRadius: '15px 15px 0 0', border: '2px solid #fff', borderBottom: 'none', color: '#fff', boxShadow: '0 -4px 10px rgba(0,0,0,0.2)', marginBottom: '0', zIndex: 1, position: 'relative', left: '-15px' }}>
          <h3 className="character-name" style={{ margin: 0, fontSize: '1.2rem', textShadow: 'none' }}>{character}</h3>
        </div>
      </div>

      <div className="dialog-content-area" style={{ paddingTop: '5px' }}>
        {message && (
          <div className="dialog-message" style={{ cursor: displayedText.length < message.length ? 'pointer' : 'default' }}>
            <p className="message-text">
              {displayedText}
              <span style={{ opacity: displayedText.length < message.length ? 1 : 0 }} className="typewriter-cursor">|</span>
            </p>
          </div>
        )}

        {children}
      </div>

      {onNext && !isTyping && (
        <button className="btn-next vn-btn-next blinking-next-btn" onClick={onNext}>
          {isLastScene ? 'Đi tiếp vào Mini Game ▶' : 'Tiếp Theo ▼'}
        </button>
      )}
    </div>
  )
}
