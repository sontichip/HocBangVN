import React, { useState } from 'react'

const API_BASE = 'http://localhost:5174'

export default function UserContentScreen({ onBack, token }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [myLessons, setMyLessons] = useState([])

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

  return (
    <div style={{padding: 20}}>
      <button onClick={onBack} style={{marginBottom: 12}}>⬅ Quay lại</button>
      <h2>Tải tài liệu của bạn lên</h2>
      <p>Hệ thống sẽ chuyển đổi tài liệu thành bài học / câu hỏi qua API.</p>
      <input type="file" accept=".pdf,.txt,.docx,.md" onChange={handleFile} />
      <div style={{marginTop: 12}}>
        <button onClick={upload} disabled={!file || status==='uploading'}>Gửi tập tin</button>
        <button onClick={loadLessons} style={{marginLeft: 8}}>Tải danh sách bài học</button>
        <span style={{marginLeft: 10}}>{status}</span>
      </div>

      {result && (
        <div style={{marginTop: 20}}>
          <h3>Kết quả</h3>
          <pre style={{whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto'}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {myLessons.length > 0 && (
        <div style={{marginTop: 20}}>
          <h3>Bài học của bạn</h3>
          <ul>
            {myLessons.map((lesson) => (
              <li key={lesson.id}>{lesson.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
