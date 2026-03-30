import '../styles/MainMenu.css'

export default function MainMenu({ onStart }) {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="title">🎮 HocBangVN</h1>
        <p className="subtitle">Learn English with Visual Novel & Mini Games</p>
        
        <div className="menu-content">
          <div className="character-teaser">
            <p className="teaser-text">Bắt đầu hành trình học tiếng Anh của bạn...</p>
          </div>

          <button className="btn-start" onClick={onStart}>
            ▶️ Bắt Đầu
          </button>

          <div className="menu-info">
            <p>📚 Học các thì tiếng Anh qua câu chuyện</p>
            <p>🎮 Mini game ôn luyện kiến thức</p>
            <p>✨ Giao diện giống Visual Novel</p>
          </div>
        </div>
      </div>
    </div>
  )
}
