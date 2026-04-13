import React, { useState } from 'react'
import '../styles/LoginScreen.css'

export default function LoginScreen({ onSelectMode }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const submit = (mode) => {
    const u = username.trim()
    if (!u) {
      setError('Vui lòng nhập tên để tiếp tục.')
      return
    }
    setError('')
    onSelectMode(mode, u)
  }

  return (
    <div className="login-hub-page">
      <div className="login-hub-card">
        <p className="login-hub-tag">HocbangVN</p>
        <h2 className="login-hub-title">Trung Tâm Học Tập</h2>
        <p className="login-hub-subtitle">Chọn một trong hai chế độ kết hợp AI theo đúng nhu cầu của bạn.</p>

        <input
          className="login-hub-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit('curated')
          }}
          placeholder="Nhập tên của bạn để bắt đầu"
        />

        <div className="hub-actions-grid">
          <button className="hub-action-card" onClick={() => submit('curated-ai')}>
            <span className="hub-action-icon">📚</span>
            <span className="hub-action-title">Chơi có sẵn + Hỏi AI</span>
            <span className="hub-action-desc">Vào game học theo level, dùng AI hỗ trợ ngay trong quá trình học.</span>
          </button>

          <button className="hub-action-card" onClick={() => submit('upload-ai')}>
            <span className="hub-action-icon">📄</span>
            <span className="hub-action-title">Gửi tài liệu + Hỏi AI</span>
            <span className="hub-action-desc">Tải file tạo bài học cá nhân và hỏi AI bổ sung tức thì.</span>
          </button>
        </div>

        {error && <div className="login-hub-error">{error}</div>}

        <div className="login-hub-footnote">
          Không nhập API key ở giao diện này. Key chỉ để trong file `.env` ở backend.
        </div>
      </div>
    </div>
  )
}
