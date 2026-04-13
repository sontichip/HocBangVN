import React from 'react'
import '../styles/StatsScreen.css'

export default function StatsScreen({ playerProfile, onBack }) {
  const { stats, streak, affection, xp } = playerProfile

  const totalAnswers = (stats?.correct || 0) + (stats?.wrong || 0)
  const winRate = totalAnswers > 0 ? Math.round(((stats?.correct || 0) / totalAnswers) * 100) : 0

  return (
    <div className="stats-screen">
      <div className="stats-header">
        <button className="back-btn" onClick={onBack}>⬅ Trở về</button>
        <h2>📊 Hồ Sơ Học Tập</h2>
        <div style={{width: '80px'}}></div>
      </div>

      <div className="stats-container">

        <div className="stats-avatar-section">
          <div className="stats-avatar">
            {playerProfile.customAvatar ? (
               <img src={playerProfile.customAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
               playerProfile.gender === 'female' ? '👧' : '👦'
            )}
          </div>
          <h2>{playerProfile.name}</h2>
          <p className="level-title">Danh hiệu: Kẻ Mộng Mơ (Cấp {Math.floor((xp || 0) / 100) + 1})</p>
        </div>

        <div className="stats-grid">

          <div className="stat-box">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <h4>Chuỗi Ngày Học</h4>
              <p>{streak?.count || 1} Ngày liên tiếp</p>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-icon">💖</span>
            <div className="stat-info">
              <h4>Độ Thân Thiết (Hana)</h4>
              <p>{affection || 0} / 100 Điểm</p>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-icon">🎯</span>
            <div className="stat-info">
              <h4>Tỷ Lệ Đúng</h4>
              <p>{winRate}% ({stats?.correct || 0}/{totalAnswers} câu)</p>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-icon">📚</span>
            <div className="stat-info">
              <h4>Từ Vựng Đã Học</h4>
              <p>{playerProfile.learnedWords?.length || 0} Từ</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
