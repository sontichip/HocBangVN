import React, { useEffect, useRef } from 'react'
import '../styles/MapScreen.css'

export default function MapScreen({ lessons, playerProfile, onSelectLesson, onBack, onOpenShop, onOpenNotebook, onOpenStats, onOpenSettings }) {
  const mapRef = useRef(null)

  const isUnlocked = (idx) => {
    if (idx === 0) return true;
    if (playerProfile?.unlockedLessons?.includes(idx)) return true;
    const prevId = lessons[idx - 1]?.id;
    if (playerProfile?.levelStars?.[prevId] > 0) return true;
    return false;
  }

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.scrollTop = mapRef.current.scrollHeight;
    }
  }, [])

  return (
    <div className="map-screen" ref={mapRef}>
      <div className="map-header">
        <button className="back-btn" onClick={onBack}>⬅ Trở về</button>
        {playerProfile?.customAvatar && (
          <img 
            src={playerProfile.customAvatar} 
            alt="Avatar" 
            className="map-avatar" 
          />
        )}
        <div className="map-stats-bar">
          <button className="map-stat-item" onClick={onOpenSettings} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>⚙️</button>
          <span className="map-stat-item">❤️ {playerProfile.hearts}</span>
          <span className="map-stat-item">💎 {playerProfile.gold || 0}</span>
          <span className="map-stat-item">⭐ {Object.values(playerProfile.levelStars || {}).reduce((a,b)=>a+b, 0)}</span>
        </div>
      </div>

      <div className="map-scroll-container">
        <div className="map-path">
          <div className="final-castle-node">🏰</div>
          
          {lessons.slice().reverse().map((lesson, reverseIdx) => {
            const originalIdx = lessons.length - 1 - reverseIdx;
            const unlocked = isUnlocked(originalIdx);
            const stars = playerProfile.levelStars?.[lesson.id] || 0;
            const isBoss = lesson.type === 'boss';
            const isLeft = originalIdx % 2 === 0;

            return (
              <div key={lesson.id} className={`map-node-container ${isLeft ? 'node-left' : 'node-right'}`}>
                {!unlocked && <div className="cloud-cover"></div>}

                <div className="map-node-wrapper">
                  {unlocked && !isBoss && (
                    <div className="star-display">
                      <span className={stars >= 1 ? 'star-filled' : 'star-empty'}>★</span>
                      <span className={stars >= 2 ? 'star-filled' : 'star-empty'}>★</span>
                      <span className={stars >= 3 ? 'star-filled' : 'star-empty'}>★</span>
                    </div>
                  )}

                  <button
                    className={`map-node ${unlocked ? 'unlocked' : 'locked'} ${isBoss ? 'boss-node' : ''}`}
                    onClick={() => unlocked && onSelectLesson(originalIdx)}
                  >
                    {unlocked ? lesson.icon : '🔒'}
                  </button>

                  <div className="map-node-title">
                    {lesson.title}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="map-start-point">🚩 Nơi bắt đầu</div>
        </div>
      </div>

      <div className="map-bottom-nav">
         <button className="nav-item" onClick={onOpenShop}>
            <span className="nav-icon">🛡️</span>
            Cửa Hàng
         </button>
         <button className="nav-item" onClick={onOpenNotebook}>
            <span className="nav-icon">📜</span>
            Sổ Phép
         </button>
         <button className="nav-item" onClick={onOpenStats}>
            <span className="nav-icon">👁️‍🗨️</span>
            Hồ Sơ
         </button>
      </div>
    </div>
  )
}
