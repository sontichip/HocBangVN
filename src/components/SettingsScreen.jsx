import React from 'react'

export default function SettingsScreen({ settings, updateSettings, onBack }) {
  return (
    <div className="stats-screen" style={{ zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="stats-header" style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>
        <button className="back-btn" onClick={onBack} style={{ background: '#334155', color: '#fff' }}>⬅ Đóng Cài Đặt</button>
        <h2 style={{ color: '#fff', textShadow: '0 0 10px #4f46e5' }}>⚙️ Tùy Chỉnh Lõi Ma Thuật</h2>
        <div style={{width: '80px'}}></div>
      </div>
      <div className="stats-container" style={{maxWidth: '600px', margin: '40px auto'}}>
        <div className="stats-grid" style={{gridTemplateColumns: '1fr', gap: '30px'}}>
        
          <div className="stat-box" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155'}}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}><span className="stat-icon" style={{ background: '#334155' }}>🎵</span> Âm Lượng Nhạc Nền</h3>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.volume ?? 0.5} 
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              style={{width: '100%', cursor: 'pointer', height: '8px'}}
            />
            <p style={{marginTop: '10px', color: '#94a3b8'}}>{Math.round((settings.volume ?? 0.5) * 100)}%</p>
          </div>

          <div className="stat-box" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155'}}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}><span className="stat-icon" style={{ background: '#334155' }}>🔊</span> Âm Lượng Hiệu Ứng (SFX)</h3>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.sfxVolume ?? 0.5} 
              onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
              style={{width: '100%', cursor: 'pointer', height: '8px'}}
            />
            <p style={{marginTop: '10px', color: '#94a3b8'}}>{Math.round((settings.sfxVolume ?? 0.5) * 100)}%</p>
          </div>

          <div className="stat-box" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155'}}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}><span className="stat-icon" style={{ background: '#334155' }}>📝</span> Kích Cỡ Chú Ngữ (Cỡ Chữ)</h3>
            <div style={{display: 'flex', gap: '15px', width: '100%'}}>
              <button 
                className={`fantasy-btn ${settings.fontSize === 'small' ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: settings.fontSize === 'small' ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ fontSize: 'small' })}
              >
                Nhỏ
              </button>
              <button 
                className={`fantasy-btn ${settings.fontSize === 'medium' ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: settings.fontSize === 'medium' ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ fontSize: 'medium' })}
              >
                Vừa
              </button>
              <button 
                className={`fantasy-btn ${settings.fontSize === 'large' ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: settings.fontSize === 'large' ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ fontSize: 'large' })}
              >
                Lớn
              </button>
            </div>
          </div>

          <div className="stat-box" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#1e293b', border: '1px solid #334155'}}>
            <h3 style={{marginBottom: '15px', color: '#fff'}}><span className="stat-icon" style={{ background: '#334155' }}>⚡</span> Tốc Độ Giải Mã (Hiển Thị Chữ)</h3>
            <div style={{display: 'flex', gap: '15px', width: '100%'}}>
              <button 
                className={`fantasy-btn ${settings.textSpeed === 'slow' ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: settings.textSpeed === 'slow' ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ textSpeed: 'slow' })}
              >
                Chậm
              </button>
              <button 
                className={`fantasy-btn ${(settings.textSpeed === 'normal' || !settings.textSpeed) ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: (settings.textSpeed === 'normal' || !settings.textSpeed) ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ textSpeed: 'normal' })}
              >
                Bình Thường
              </button>
              <button 
                className={`fantasy-btn ${settings.textSpeed === 'fast' ? 'selected' : ''}`}
                style={{flex: 1, padding: '10px', background: settings.textSpeed === 'fast' ? '#4f46e5' : '#334155', color: '#fff'}}
                onClick={() => updateSettings({ textSpeed: 'fast' })}
              >
                Tức Thì
              </button>
            </div>
            <p style={{marginTop: '20px', color: '#94a3b8', fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'medium' ? '18px' : '24px'}}>
              * Câu chú mẫu sẽ hiển thị như thế này trên cuộn giấy da.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
