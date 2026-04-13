import { useState, useMemo } from 'react'
import '../styles/LessonSelector.css'

export default function LessonSelector({ lessons, onSelectLesson, onBack, playerProfile }) {
  const [activeTab, setActiveTab] = useState('All')

  const categories = useMemo(() => {
    const cats = new Set(lessons.map(l => l.category).filter(Boolean))
    return ['All', ...Array.from(cats)]
  }, [lessons])

  const filteredLessons = useMemo(() => {
    if (activeTab === 'All') return lessons
    return lessons.filter(l => l.category === activeTab)
  }, [lessons, activeTab])

  const avatar = playerProfile?.gender === 'female' ? '👧' : '👦'
  const playerName = playerProfile?.name || 'Player'
  const unlocked = playerProfile?.unlockedLessons || [0]
  const hearts = playerProfile?.hearts ?? 5
  const xp = playerProfile?.xp ?? 0

  return (
    <div className="lesson-selector-screen">
      {/* HEADER: Player Profile & Back Button */}
      <div className="ls-header">
        <button className="ls-back-btn" onClick={onBack}>⬅ Back to Menu</button>
        <div className="ls-player-stats">
          <div className="stat-pill hearts-pill">❤️ {hearts}/5</div>
          <div className="stat-pill xp-pill">🌟 {xp} XP</div>
        </div>
        <div className="ls-player-profile">
          <span className="ls-player-avatar">{avatar}</span>
          <div className="ls-player-info">
            <span className="ls-player-name">{playerName}</span>
            <span className="ls-player-title">Newbie Adventurer</span>
          </div>
        </div>
      </div>

      <div className="ls-container">
        <h1 className="ls-title">Select Route (Chương Hồi)</h1>
        
        {/* TAB NAVIGATION */}
        <div className="ls-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`ls-tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CHAPTER LIST */}
        <div className="ls-chapter-grid">
          {filteredLessons.map((lesson) => {
            const originalIdx = lessons.indexOf(lesson)
            const isUnlocked = unlocked.includes(originalIdx)

            return (
              <div 
                key={lesson.id}
                className={`ls-chapter-card ${!isUnlocked ? 'locked' : ''}`}
                onClick={() => isUnlocked ? onSelectLesson(originalIdx) : alert('Bài học này chưa được mở khóa!')}
              >
                <div className="ls-chapter-indicator">Chapter {originalIdx + 1}</div>
                <div className="ls-chapter-content">
                  <h3 className="ls-chapter-title">
                    {isUnlocked ? lesson.title : '??? (Locked)'}
                  </h3>
                  <p className="ls-chapter-desc">
                    {isUnlocked ? lesson.description : 'Hoàn thành bài trước để mở khóa cốt truyện này.'}
                  </p>
                  <div className="ls-chapter-footer">
                    <span className="ls-tag">{lesson.category}</span>
                    <span className="ls-reward">🌟 {lesson.reward?.xp || 15} XP</span>
                  </div>
                </div>
                <div className="ls-chapter-action">
                  <span>{isUnlocked ? 'Play ▶' : '🔒'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
