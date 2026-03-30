import { useState } from 'react'
import '../styles/LessonSelector.css'

export default function LessonSelector({ lessons, onSelectLesson, onBack }) {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(null)

  const handleSelectLesson = (idx) => {
    setSelectedLessonIdx(idx)
    setTimeout(() => onSelectLesson(idx), 300)
  }

  return (
    <div className="lesson-selector">
      <div className="selector-header">
        <button className="btn-back" onClick={onBack}>← Quay Lại</button>
        <h2 className="selector-title">Chọn Bài Học</h2>
      </div>
      <div className="lesson-list">
        {lessons.map((lesson, idx) => (
          <div
            key={lesson.id || idx}
            className={`lesson-card${selectedLessonIdx === idx ? ' selected' : ''}`}
            style={{ background: lesson.color || '#eee' }}
            onClick={() => handleSelectLesson(idx)}
          >
            <span className="lesson-icon">{lesson.icon || '📘'}</span>
            <div className="lesson-info">
              <h3 className="lesson-title">{lesson.title}</h3>
              <p className="lesson-desc">{lesson.description || ''}</p>
              <span className="lesson-level">{lesson.level || ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
