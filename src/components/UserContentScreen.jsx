import React, { useMemo, useState } from 'react'
import MultipleChoiceGame from './games/MultipleChoiceGame'
import FillBlanksGame from './games/FillBlanksGame'
import WordMatchGame from './games/WordMatchGame'
import SentenceBuilderGame from './games/SentenceBuilderGame'
import DictationGame from './games/DictationGame'
import SpacedRepetitionGame from './games/SpacedRepetitionGame'
import EssayQuestionGame from './games/EssayQuestionGame'

const API_BASE = 'http://localhost:5174'

function getActivities(lesson) {
  const generated = lesson?.generated
  if (generated && Array.isArray(generated.activities) && generated.activities.length > 0) {
    return generated.activities
  }
  return []
}

function ActivityRenderer({ activity, disabled, token, onComplete }) {
  if (!activity?.type) return null
  if (activity.type === 'multipleChoice') {
    return (
      <MultipleChoiceGame
        question={activity.question}
        options={activity.options || []}
        answerIndex={activity.answerIndex || 0}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'fillBlanks') {
    return (
      <FillBlanksGame
        question={activity.question || ''}
        answer={activity.answer || ''}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'wordMatch') {
    return (
      <WordMatchGame
        pairs={activity.pairs || []}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'sentenceBuilder') {
    return (
      <SentenceBuilderGame
        words={activity.words || []}
        sentence={activity.answer || ''}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'dictation') {
    return (
      <DictationGame
        text={activity.text || ''}
        hint={activity.hint}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'spacedRepetition') {
    return (
      <SpacedRepetitionGame
        cards={activity.cards || []}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  if (activity.type === 'essay') {
    return (
      <EssayQuestionGame
        prompt={activity.prompt || ''}
        rubric={activity.rubric}
        token={token}
        onComplete={onComplete}
        disabled={disabled}
      />
    )
  }
  return (
    <div style={{ opacity: 0.8 }}>
      <p>Loại bài tập chưa hỗ trợ: {activity.type}</p>
      <button className="submit-btn" onClick={() => onComplete({ success: false, message: 'Bỏ qua bài tập chưa hỗ trợ.' })}>
        Bỏ qua
      </button>
    </div>
  )
}

export default function UserContentScreen({ onBack, token }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [myLessons, setMyLessons] = useState([])
  const [activeLessonId, setActiveLessonId] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})

  const activeLesson = useMemo(
    () => myLessons.find((lesson) => lesson.id === activeLessonId) || null,
    [myLessons, activeLessonId]
  )
  const activities = useMemo(() => getActivities(activeLesson), [activeLesson])
  const currentActivity = activities[currentIdx]
  const finished = activeLesson && activities.length > 0 && currentIdx >= activities.length
  const score = useMemo(() => Object.values(answers).filter((item) => item?.success).length, [answers])

  const resetPractice = (lessonId = null) => {
    setActiveLessonId(lessonId)
    setCurrentIdx(0)
    setAnswers({})
  }

  const handleFile = (e) => {
    setFile(e.target.files[0])
    setResult(null)
  }

  const upload = async () => {
    if (!file) return
    setStatus('uploading')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE}/api/process`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      setResult(json)
      setStatus('done')
      await loadLessons()
    } catch (e) {
      setStatus('error')
      setResult({ error: e.message })
    }
  }

  const loadLessons = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Cannot load lessons')
      const list = await res.json()
      setMyLessons(list)
    } catch (e) {
      setResult({ error: e.message })
    }
  }

  const handleCompleteActivity = (activityResult) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: activityResult }))
  }

  const nextActivity = () => {
    if (!answers[currentIdx]) return
    setCurrentIdx((idx) => idx + 1)
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>⬅ Quay lại</button>
      <h2>Tải tài liệu của bạn lên</h2>
      <p>Hệ thống sẽ tạo bộ bài tập gồm flashcard trắc nghiệm, điền từ, ghép nối, sắp xếp câu, dictation, SRS và tự luận chấm bằng Gemini.</p>
      <input type="file" accept=".pdf,.txt,.docx,.md" onChange={handleFile} />
      <div style={{ marginTop: 12 }}>
        <button onClick={upload} disabled={!file || status === 'uploading'}>Gửi tập tin</button>
        <button onClick={loadLessons} style={{ marginLeft: 8 }}>Tải danh sách bài học</button>
        <span style={{ marginLeft: 10 }}>{status}</span>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Kết quả tạo bài</h3>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {myLessons.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Bài học của bạn</h3>
          <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>
            {myLessons.map((lesson) => {
              const lessonActivities = getActivities(lesson)
              return (
                <li key={lesson.id} style={{ border: '1px solid rgba(148,163,184,0.35)', borderRadius: 10, padding: 10 }}>
                  <strong>{lesson.generated?.title || lesson.title}</strong>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>{lesson.generated?.description || 'Không có mô tả.'}</div>
                  <div style={{ marginTop: 6, opacity: 0.8 }}>Số hoạt động: {lessonActivities.length}</div>
                  <button style={{ marginTop: 8 }} onClick={() => resetPractice(lesson.id)}>
                    Bắt đầu luyện tập
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {activeLesson && (
        <div style={{ marginTop: 24, border: '1px solid rgba(148,163,184,0.4)', borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Luyện tập: {activeLesson.generated?.title || activeLesson.title}</h3>
          {!activities.length ? (
            <p>Chưa có hoạt động trong bài học này.</p>
          ) : finished ? (
            <div>
              <p>🎉 Hoàn thành! Điểm của bạn: {score}/{activities.length}</p>
              <button onClick={() => resetPractice(activeLesson.id)}>Làm lại</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ opacity: 0.8 }}>
                Bài {currentIdx + 1}/{activities.length} · {currentActivity?.title || currentActivity?.type}
              </div>
              <ActivityRenderer
                activity={currentActivity}
                disabled={!!answers[currentIdx]}
                token={token}
                onComplete={handleCompleteActivity}
              />
              {answers[currentIdx] ? (
                <div style={{ background: 'rgba(15,23,42,0.3)', padding: 10, borderRadius: 10 }}>
                  <p style={{ margin: 0 }}>{answers[currentIdx].success ? '✅ Đúng' : '❌ Chưa đúng'}</p>
                  {answers[currentIdx].message ? <p style={{ marginBottom: 0 }}>{answers[currentIdx].message}</p> : null}
                  <button style={{ marginTop: 8 }} onClick={nextActivity}>Tiếp tục</button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
