import React from 'react'
import '../styles/NotebookScreen.css'

export default function NotebookScreen({ playerProfile, onBack }) {
  const words = playerProfile?.learnedWords || []

  const playAudio = (word) => {
    // text to speech mock
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="notebook-screen">
      <div className="notebook-header">
        <button className="back-btn" onClick={onBack}>⬅ Trở về</button>
        <div className="notebook-title">📖 Sổ Từ Vựng</div>
      </div>
      
      <div className="notebook-container">
        {words.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa học từ vựng nào cả.</p>
            <p className="sub">Hãy tham gia khóa học và hoàn thành minigame để thu thập từ vựng nhé!</p>
          </div>
        ) : (
          <div className="word-list">
            {words.map((w, idx) => (
              <div key={idx} className="word-card">
                <div className="word-info">
                  <span className="word-en">{w.en}</span>
                  <span className="word-vi">{w.vn}</span>
                </div>
                <button className="listen-btn" onClick={() => playAudio(w.en)}>🔊 Nghe</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
