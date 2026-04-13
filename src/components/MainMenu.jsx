import React from 'react'
import '../styles/MainMenu.css'

export default function MainMenu({ playerProfile, onNewGame, onContinue, onSettings }) {
  return (
    <div className="main-menu-container dark-fantasy-menu">
      <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop" alt="Dark Fantasy Background" className="main-bg animate-slow-zoom" />

      <div className="title-card dark-title">
        <h1 className="game-title">
          <span className="title-en glow">SHADOW</span>
          <span className="title-vn gold-text">CASTLE</span>
        </h1>
        <p className="subtitle">Hành trình đánh bại chúa tể bóng tối học đường</p>
      </div>

      <div className="center-menu-content basic-menu shadow-menu">
        {playerProfile && (
           <button className="start-btn pulse fantasy-btn main-btn" onClick={onContinue}>
             ⟡ Tiếp Tục Hành Trình ⟡
           </button>
        )}

        <button className="start-btn new-game-btn fantasy-btn" onClick={onNewGame}>
          {playerProfile ? '⟡ Khởi Đầu Lại (Xóa Dữ Liệu)' : '⟡ Khởi Hành Mới'}
        </button>

        <button className="start-btn settings-btn fantasy-btn" onClick={onSettings}>
          ⟡ Cài Đặt ⟡
        </button>
      </div>
    </div>
  )
}
