import React, { useState } from 'react'
import '../styles/LoginScreen.css'

export default function LoginScreen({ onSelectMode }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  const startGoogleSignIn = () => {
    // Try configured upload API base or common local dev host
    const configuredBase = import.meta.env.VITE_UPLOAD_API_BASE || ''
    const candidates = [configuredBase, 'http://localhost:5188', 'http://localhost:5174']
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)

    const openForBase = async (base) => {
      try {
        const w = window.open(`${base}/auth/google`, 'google_oauth', 'width=600,height=700')
        if (!w) throw new Error('Popup blocked')

        const listener = (e) => {
          try {
            if (!e.data || !e.data.token) return
            const { token, username: u, base: serverBase } = e.data
            window.removeEventListener('message', listener)
            // pass authData to parent handler
            onSelectMode('curated-ai', u || '', { token, base: serverBase || base })
            try { w.close() } catch (e) {}
          } catch (err) {
            // ignore
          }
        }
        window.addEventListener('message', listener)
      } catch (e) {
        setError('Không thể mở popup Google Sign-In.')
      }
    }

    // try each candidate until one opens
    for (const base of candidates) {
      if (!base) continue
      openForBase(base)
      break
    }
  }

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

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button onClick={startGoogleSignIn} style={{ background: '#0b6b3a', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Đăng nhập với Google</button>
        </div>

        {error && <div className="login-hub-error">{error}</div>}

        <div className="login-hub-footnote">Sẵn sàng học chưa? Chọn chế độ phù hợp và bắt đầu ngay.</div>
      </div>
    </div>
  )
}
