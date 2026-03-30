import { useState } from 'react'
import DialogBox from './DialogBox'
import MiniGame from './MiniGame'
import '../styles/VisualNovelScreen.css'

export default function VisualNovelScreen({ lesson, onBack }) {
  const [vnStep, setVnStep] = useState(0)
  const [miniGameIdx, setMiniGameIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [inMiniGame, setInMiniGame] = useState(false)

  const vnNode = lesson.visualNovel[vnStep]
  const miniGame = lesson.miniGames[miniGameIdx]

  function handleChoice(nextId) {
    if (nextId === undefined || nextId === null) {
      setInMiniGame(true)
      return
    }

    const idx = lesson.visualNovel.findIndex((n) => n.id === nextId)
    if (idx !== -1) {
      setVnStep(idx)
    } else {
      setFinished(true)
    }
  }

  function handleMiniGameResult(correct) {
    if (correct) setScore((current) => current + 1)

    if (miniGameIdx + 1 < lesson.miniGames.length) {
      setMiniGameIdx((current) => current + 1)
      setInMiniGame(false)
    } else {
      setFinished(true)
    }
  }

  function handleRestart() {
    setVnStep(0)
    setMiniGameIdx(0)
    setScore(0)
    setFinished(false)
    setInMiniGame(false)
  }

  if (finished) {
    return (
      <div className="visual-novel-screen wonderland-screen">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="completion-content wonderland-card">
          <p className="tiny-label">Journey Complete</p>
          <h2 className="completion-title">🎉 Chúc Mừng!</h2>
          <p className="completion-text">Bạn đã hoàn thành bài <strong>{lesson.title}</strong></p>
          <div className="completion-stats">
            <p>✨ Điểm mini game: {score}/{lesson.miniGames.length}</p>
            <p>🪄 Thưởng: {lesson.reward?.xp || 0} XP, {lesson.reward?.stars || 0} sao</p>
          </div>
          <div className="completion-actions">
            <button className="btn-back-home" onClick={onBack}>← Quay lại chọn bài</button>
            <button className="btn-restart" onClick={handleRestart}>Chơi lại bài này</button>
          </div>
        </div>
        <div className="cat-strip">
          <img className="wonderland-cat" src="/cat-wonderland.svg" alt="Wonderland cat" />
        </div>
      </div>
    )
  }

  if (inMiniGame) {
    return (
      <div className="visual-novel-screen wonderland-screen">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="storybook-shell wonderland-card">
          <div className="game-stage-header">
            <p className="tiny-label">Mini Game</p>
            <h2>{lesson.title}</h2>
            <p className="stage-summary">{lesson.theory?.summary}</p>
          </div>
          <MiniGame game={miniGame} onComplete={handleMiniGameResult} />
        </div>
        <div className="cat-strip">
          <img className="wonderland-cat" src="/cat-wonderland.svg" alt="Wonderland cat" />
        </div>
      </div>
    )
  }

  if (!vnNode) return <div className="visual-novel-screen loading-screen">Loading...</div>

  const progressPercent = Math.round(((vnStep + 1) / lesson.visualNovel.length) * 100)

  return (
    <div className="visual-novel-screen wonderland-screen">
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <header className="novel-header wonderland-card">
        <button className="btn-back" onClick={onBack}>← Quay lại</button>
        <div className="header-title-wrap">
          <p className="tiny-label">Wonderland Lesson</p>
          <h1 className="lesson-name">{lesson.icon} {lesson.title}</h1>
          <p className="lesson-desc">{lesson.description}</p>
        </div>
        <div className="scene-indicator">
          <span>Scene {vnStep + 1}/{lesson.visualNovel.length}</span>
          <div className="progress-bar"><span style={{ width: `${progressPercent}%` }} /></div>
        </div>
      </header>

      <main className="novel-stage">
        <section className="storybook-shell wonderland-card">
          <div className="theory-chip-row">
            <span className="theory-chip">{lesson.theory?.structure}</span>
            <span className="theory-chip">{lesson.level}</span>
          </div>

          <DialogBox
            character={vnNode.speaker}
            message={vnNode.text}
            translation={lesson.theory?.summary}
            example={lesson.theory?.examples?.join(' / ')}
            onNext={() => handleChoice(vnNode.choices?.[0]?.next)}
            isLastScene={!vnNode.choices || vnNode.choices.length === 0}
          />

          <div className="choice-forest">
            {(vnNode.choices && vnNode.choices.length > 0) ? (
              vnNode.choices.map((choice, index) => (
                <button key={`${choice.text}-${index}`} className="choice-pill" onClick={() => handleChoice(choice.next)}>
                  {choice.text}
                </button>
              ))
            ) : (
              <button className="choice-pill primary" onClick={() => handleChoice(null)}>
                Đi tiếp vào mini game
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="cat-strip">
        <img className="wonderland-cat" src="/cat-wonderland.svg" alt="Wonderland cat" />
      </footer>
    </div>
  )
}
