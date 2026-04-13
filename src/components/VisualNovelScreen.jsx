import { useState, useEffect } from 'react'
import DialogBox from './DialogBox'
import MiniGame from './MiniGame'
import '../styles/VisualNovelScreen.css'

export default function VisualNovelScreen({ lesson, lessonIdx, onBack, onOpenSettings, audioRef, playerProfile, updateProfile, settings }) {
  const [vnStep, setVnStep] = useState(0)
  const [miniGameIdx, setMiniGameIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [inMiniGame, setInMiniGame] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)

  const [localHearts, setLocalHearts] = useState(playerProfile?.hearts || 5)
  const [localAffection, setLocalAffection] = useState(playerProfile?.affection || 0)

  const bgEquipped = playerProfile?.equipped?.background || 'default'
  const outfitEquipped = playerProfile?.equipped?.outfit || 'default'
  
  const bgMap = { 'default': '/background.png', 'cafe': '/background.png', 'park': '/background.png' }
  const outfitMap = { 'default': '/kitty.jpg', 'winter': '/kitty.jpg', 'summer': '/kitty.jpg' }

  useEffect(() => {
    if (!audioRef || !audioRef.current) return
    const a = audioRef.current
    const onPlay = () => setAudioPlaying(true)
    const onPause = () => setAudioPlaying(false)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    setAudioPlaying(!a.paused)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, [audioRef])

  const vnNode = lesson.visualNovel[vnStep]
  const miniGame = lesson.miniGames[miniGameIdx]

  function handleChoice(nextId) {
    if (nextId === undefined || nextId === null) {
      setInMiniGame(true)
      return
    }
    const idx = lesson.visualNovel.findIndex((n) => n.id === nextId)
    if (idx !== -1) {
      setVnStep(idx)
    } else {
      completeLesson()
    }
  }

  function completeLesson() {
    setFinished(true)
    if (updateProfile) {
      const totalGames = lesson.miniGames ? lesson.miniGames.length : 1;
      const ratio = score / (totalGames || 1);
      let stars = 1;
      if (ratio === 1) stars = 3;
      else if (ratio >= 0.5) stars = 2;
      
      const currentLevelStars = playerProfile.levelStars?.[lesson.id] || 0;
      const newStars = Math.max(currentLevelStars, stars);

      const wonXP = lesson.reward?.xp || 15
      const wonGold = lesson.reward?.gold || 20 

      updateProfile({
        levelStars: {
          ...(playerProfile.levelStars || {}),
          [lesson.id]: newStars
        },
        xp: (playerProfile.xp || 0) + wonXP,
        gold: (playerProfile.gold || 0) + wonGold,
        affection: localAffection
      })
    }
  }

  function handleMiniGameResult(correct) {
    let newLearnedWords = [...(playerProfile?.learnedWords || [])]

    if (correct) {
      setScore((current) => current + 1)
      setLocalAffection(a => a + 5)
      
      if (updateProfile) {
        updateProfile({
           stats: {
             ...playerProfile.stats,
             correct: (playerProfile.stats?.correct || 0) + 1
           }
        })
      }

      if (miniGame.type === 'wordMatch' && miniGame.pairs) {
        miniGame.pairs.forEach(p => {
          if (!newLearnedWords.some(w => w.en === p.a)) {
            newLearnedWords.push({ en: p.a, vn: p.b })
          }
        })
      }
      if (miniGame.type === 'fillBlanks' && miniGame.answer) {
         if (!newLearnedWords.some(w => w.en === miniGame.answer)) {
           newLearnedWords.push({ en: miniGame.answer, vn: 'Từ khóa bài học' })
         }
      }
      updateProfile({ learnedWords: newLearnedWords })

    } else {
      const newHearts = localHearts - 1
      setLocalHearts(newHearts)
      setLocalAffection(a => Math.max(0, a - 2))
      
      if (updateProfile) {
        updateProfile({
           hearts: newHearts,
           stats: {
             ...playerProfile.stats,
             wrong: (playerProfile.stats?.wrong || 0) + 1
           }
        })
      }
      if (newHearts <= 0) {
        alert("Bạn đã hết ❤️! Hãy ôn tập để hồi phục.")
        onBack()
        return
      }
    }

    if (miniGameIdx + 1 < lesson.miniGames.length) {
      setMiniGameIdx((current) => current + 1)
      setInMiniGame(false)
    } else {
      completeLesson()
    }
  }

  function handleRestart() {
    setVnStep(0)
    setMiniGameIdx(0)
    setScore(0)
    setFinished(false)
    setInMiniGame(false)
  }

  if (finished) {
    const totalGames = lesson.miniGames ? lesson.miniGames.length : 1;
    const ratio = score / (totalGames || 1);
    let stars = 1;
    if (ratio === 1) stars = 3;
    else if (ratio >= 0.5) stars = 2;

    return (
      <div className="visual-novel-screen wonderland-screen" style={{ backgroundImage: `url(${bgMap[bgEquipped]})` }}>
        <div className="completion-content wonderland-card" style={{ zIndex: 10, margin: 'auto' }}>
          <h2 className="completion-title">🎉 Chúc Mừng!</h2>
          <div style={{ fontSize: '32px', textAlign: 'center', margin: '10px 0' }}>
            <span style={{ color: stars >= 1 ? '#f1c40f' : '#bdc3c7' }}>★</span>
            <span style={{ color: stars >= 2 ? '#f1c40f' : '#bdc3c7' }}>★</span>
            <span style={{ color: stars >= 3 ? '#f1c40f' : '#bdc3c7' }}>★</span>
          </div>
          <p className="completion-text">Bạn đã hoàn thành bài <strong>{lesson.title}</strong></p>
          <div className="completion-stats">
            <p>✨ Điểm mini game: {score}/{lesson.miniGames?.length || 0}</p>
            <p>🌟 Kinh nghiệm nhận được: +{lesson.reward?.xp || 15} XP</p>
            <p>💰 Vàng thưởng: +{lesson.reward?.gold || 20} G</p>
            <p>💖 Thay đổi thân thiết: {localAffection - (playerProfile.affection || 0)} điểm</p>
          </div>
          <div className="completion-actions">
            <button className="btn-back-home" onClick={onBack}>← Quay lại bản đồ</button>
            <button className="btn-restart" onClick={handleRestart}>Chơi lại bài này</button>
          </div>
        </div>
      </div>
    )
  }

  if (!vnNode && !inMiniGame) return <div className="visual-novel-screen">Loading...</div>

  const speakerName = inMiniGame ? 'Hana (Mèo)' : vnNode?.speaker || 'Hana (Mèo)';
  const isHana = speakerName === 'Hana (Mèo)' || speakerName === 'Hana';
  const speakerAvatar = isHana ? (outfitMap[outfitEquipped] || '/kitty.jpg') : (playerProfile?.customAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(speakerName || 'Mage')}&background=random`);

  let messageText = inMiniGame ? 'Nhanh lên ngài pháp sư! Khảo nghiệm ma lực bắt đầu!' : vnNode?.text;
  if (!inMiniGame && localAffection >= 50 && vnStep === 0) {
    messageText = "[💖 Liên Kết Linh Hồn]: Ma lực của ngài đang cộng hưởng rất tốt với tôi, ngài pháp sư! " + (vnNode?.text || "")
  }

  const progressRatio = inMiniGame 
    ? 50 + (50 * (miniGameIdx / lesson.miniGames.length))
    : (50 * (vnStep / Math.max(1, lesson.visualNovel.length - 1)))

  return (
    <div className="visual-novel-screen true-vn-layout" style={{ backgroundImage: `url(${bgMap[bgEquipped]})` }}>
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      <div className="vn-top-bar">
        <div className="gear-menu-container">
          <button className="gear-btn" onClick={() => setMenuOpen(!menuOpen)}>⚙️</button>
          {menuOpen && (
            <div className="gear-dropdown">
              <button className="sys-btn" onClick={onBack}>HOME</button>
              <button className="sys-btn" onClick={onOpenSettings}>SETTINGS</button>
              <button className="sys-btn skip-btn" onClick={completeLesson}>SKIP &gt;&gt;</button>
              {audioRef && audioRef.current && (
                <button
                  className="sys-btn"
                  onClick={() => {
                    if (audioRef.current.paused) audioRef.current.play().catch(()=>{})
                    else audioRef.current.pause()
                  }}
                >
                  {audioPlaying ? 'Pause Music' : 'Play Music'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="player-live-stats" style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', color: '#ff4757', fontWeight: 'bold' }}>
             ❤️ {localHearts}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', color: '#ff9ff3', fontWeight: 'bold' }}>
             💖 {localAffection}
          </div>
        </div>

        <div className="exp-wrapper true-vn-exp" style={{ marginLeft: 'auto' }}>
          <div className="exp-icon">🌟</div>
          <div className="exp-track"><div className="exp-fill" style={{ width: `${progressRatio}%` }}></div></div>
        </div>
      </div>

      <div className="vn-sprite-container">
        <img src={outfitMap[outfitEquipped] || '/kitty.jpg'} alt="Character" className="vn-sprite-img" style={{ objectFit: 'cover' }} />
      </div>

      <div className="vn-dialog-container">
        <DialogBox
          character={speakerName}
          speakerAvatar={speakerAvatar}
          message={messageText}
          textSpeed={settings?.textSpeed || 'normal'}
          isLastScene={!inMiniGame && (!vnNode.choices || vnNode.choices.length === 0)}
          onNext={!inMiniGame && (vnNode.choices?.length === 0 || !vnNode.choices) ? () => handleChoice(null) : null}
        >
          {inMiniGame ? (
            <div className="minigame-in-dialog">
              <MiniGame game={miniGame} onComplete={handleMiniGameResult} />
            </div>
          ) : (
            <div className="choice-forest vn-inline-choices">
              {vnNode.choices && vnNode.choices.length > 0 && vnNode.choices.map((choice, index) => (
                <button key={index} className="choice-pill" onClick={() => handleChoice(choice.next)}>{choice.text}</button>
              ))}
            </div>
          )}
        </DialogBox>
      </div>
    </div>
  )
}
