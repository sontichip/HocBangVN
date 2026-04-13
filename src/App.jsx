import { useState, useEffect, useRef } from 'react'
import VisualNovelScreen from './components/VisualNovelScreen'
import MainMenu from './components/MainMenu'
import MapScreen from './components/MapScreen'
import CharacterCreation from './components/CharacterCreation'
import ShopScreen from './components/ShopScreen'
import StatsScreen from './components/StatsScreen'
import NotebookScreen from './components/NotebookScreen'
import SettingsScreen from './components/SettingsScreen'
import LoginScreen from './components/LoginScreen'
import UserContentScreen from './components/UserContentScreen'
import AiAssistantScreen from './components/AiAssistantScreen'
import { lessons } from './lessons'
import './App.css'

const MAX_HEARTS = 5;

function App() {
  const [gameState, setGameState] = useState('login')
  const [username, setUsername] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [lastNonAiState, setLastNonAiState] = useState('login')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentLessonIdx, setCurrentLessonIdx] = useState(null)
  const [playerProfile, setPlayerProfile] = useState(null)
  const [settings, setSettings] = useState({ volume: 0.5, fontSize: 'medium' })
  const audioRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('hocbang_vn_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const now = Date.now()
        if (parsed.hearts < MAX_HEARTS && parsed.lastHeartLoss) {
          const diffMin = Math.floor((now - parsed.lastHeartLoss) / 60000)
          if (diffMin > 0) {
            const recovered = Math.min(MAX_HEARTS - parsed.hearts, Math.floor(diffMin / 5))
            parsed.hearts += recovered
            if (parsed.hearts === MAX_HEARTS) parsed.lastHeartLoss = null
            else parsed.lastHeartLoss += recovered * 300000
          }
        }
        const todayStr = new Date().toDateString()
        if (!parsed.streak) parsed.streak = { count: 0, lastLogin: null }
        if (parsed.streak.lastLogin !== todayStr) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          if (parsed.streak.lastLogin === yesterday.toDateString()) {
            parsed.streak.count += 1
          } else if (parsed.streak.lastLogin !== todayStr) {
            parsed.streak.count = 1
          }
          parsed.streak.lastLogin = todayStr
        }
        if (parsed.gold === undefined) parsed.gold = 50
        if (parsed.affection === undefined) parsed.affection = 0
        if (!parsed.inventory) parsed.inventory = { outfits: ['default'], backgrounds: ['default'] }
        if (!parsed.equipped) parsed.equipped = { outfit: 'default', background: 'default' }
        if (!parsed.learnedWords) parsed.learnedWords = []
        if (!parsed.stats) parsed.stats = { correct: 0, wrong: 0, categories: {} }
        if (!parsed.levelStars) parsed.levelStars = {}
        setPlayerProfile(parsed)
      } catch (e) {}
    }
    
    // Load Settings
    const savedSettings = localStorage.getItem('hocbang_vn_settings')
    if (savedSettings) {
      try {
        const parsedS = JSON.parse(savedSettings)
        setSettings(parsedS)
      } catch(e) {}
    }
  }, [])

  useEffect(() => {
    if (playerProfile) {
      localStorage.setItem('hocbang_vn_profile', JSON.stringify(playerProfile))
    }
  }, [playerProfile])
  
  useEffect(() => {
    localStorage.setItem('hocbang_vn_settings', JSON.stringify(settings))
    if (audioRef.current && typeof settings.volume !== 'undefined') {
        audioRef.current.volume = Math.max(0, Math.min(1, Number(settings.volume)))
    }
    // Apply global font size class
    document.documentElement.className = `font-size-${settings.fontSize}`
  }, [settings])

  useEffect(() => {
    audioRef.current = new Audio('/assets/bgm.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = settings.volume
    audioRef.current.play().catch(() => {})
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, []) // Empty dependency array as we only want to initialize once

  const handleCharacterCreation = (profile) => {
    const todayStr = new Date().toDateString()
    const initialProfile = {
      ...profile,
      unlockedLessons: [0],
      xp: 0,
      hearts: MAX_HEARTS,
      lastHeartLoss: null,
      gold: 50,
      affection: 0,
      inventory: { outfits: ['default'], backgrounds: ['default'] },
      equipped: { outfit: 'default', background: 'default' },
      learnedWords: [],
      streak: { count: 1, lastLogin: todayStr },
      stats: { correct: 0, wrong: 0, categories: {} },
      levelStars: {}
    }
    setPlayerProfile(initialProfile)
    setGameState('lesson-select')
  }

  const handleSelectLesson = (lessonIdx) => {
    if (playerProfile.hearts <= 0) {
      alert("Bạn đã hết trái tim! Hãy đợi một chút để hồi phục.")
      return
    }
    setCurrentLessonIdx(lessonIdx)
    setGameState('playing')
    if (audioRef.current) audioRef.current.play().catch(() => {})
  }

  const updateProfile = (updates) => {
    setPlayerProfile(prev => {
      const next = { ...prev, ...updates }
      if (next.hearts < prev.hearts && !prev.lastHeartLoss) {
         next.lastHeartLoss = Date.now()
      }
      return next
    })
  }
  
  const updateSettings = (updates) => {
    setSettings(prev => {
      const nextSettings = { ...prev, ...updates };
      if (typeof updates.volume !== 'undefined' && audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, Number(updates.volume)));
      }
      return nextSettings;
    })
  }

  const handleBackToMenu = () => {
    setGameState('lesson-select')
    setCurrentLessonIdx(null)
  }

  const handleSelectMode = async (mode, inputUsername) => {
    const finalUsername = (inputUsername || '').trim()
    if (!finalUsername) return
    setUsername(finalUsername)

    if (mode === 'upload-ai') {
      try {
        const res = await fetch('http://localhost:5174/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: finalUsername })
        })
        if (!res.ok) throw new Error('Đăng nhập backend thất bại')
        const data = await res.json()
        setAuthToken(data.token || '')
        setLastNonAiState('upload')
        setGameState('upload')
      } catch (e) {
        alert(e.message)
      }
      return
    }

    if (mode === 'curated-ai') {
      if (playerProfile) {
        setLastNonAiState('menu')
        setGameState('menu')
      } else {
        setLastNonAiState('character-creation')
        setGameState('character-creation')
      }
    }
  }

  const openAiAssistant = () => {
    setLastNonAiState(gameState)
    setGameState('ai-assistant')
  }

  return (
    <div className="app">
      {gameState === 'login' && (
        <LoginScreen onSelectMode={handleSelectMode} />
      )}

      {gameState === 'menu' && (
        <MainMenu
          playerProfile={playerProfile}
          onContinue={() => setGameState('lesson-select')}
          onSettings={() => setIsSettingsOpen(true)}
          onNewGame={() => {
            if (window.confirm("Bắt đầu trò chơi mới sẽ xóa toàn bộ dữ liệu hiện tại. Bạn có chắc chắn không?")) {
              localStorage.removeItem('hocbang_vn_profile')
              setPlayerProfile(null)
              setGameState('character-creation')
            }
          }}
        />
      )}
      
      {isSettingsOpen && (
          <SettingsScreen 
             settings={settings} 
             updateSettings={updateSettings} 
             onBack={() => setIsSettingsOpen(false)} 
          />
      )}

      {gameState === 'character-creation' && (
         <CharacterCreation onComplete={handleCharacterCreation} />
      )}

      {gameState === 'lesson-select' && playerProfile && (
        <MapScreen
          lessons={lessons}
          onSelectLesson={handleSelectLesson}
          onBack={() => setGameState('menu')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          playerProfile={playerProfile}
          onOpenShop={() => setGameState('shop')}
          onOpenNotebook={() => setGameState('notebook')}
          onOpenStats={() => setGameState('stats')}
        />
      )}

      {gameState === 'shop' && playerProfile && (
        <ShopScreen playerProfile={playerProfile} updateProfile={updateProfile} onBack={() => setGameState('lesson-select')} />
      )}

      {gameState === 'stats' && playerProfile && (
        <StatsScreen playerProfile={playerProfile} onBack={() => setGameState('lesson-select')} />
      )}

      {gameState === 'notebook' && playerProfile && (
        <NotebookScreen playerProfile={playerProfile} onBack={() => setGameState('lesson-select')} />
      )}

      {gameState === 'upload' && (
        <UserContentScreen onBack={() => setGameState('login')} token={authToken} />
      )}

      {gameState === 'ai-assistant' && (
        <AiAssistantScreen onBack={() => setGameState(lastNonAiState || 'login')} username={username} />
      )}

      {gameState === 'playing' && currentLessonIdx !== null && lessons[currentLessonIdx] && (
        <VisualNovelScreen
          lesson={lessons[currentLessonIdx]}
          lessonIdx={currentLessonIdx}
          onBack={handleBackToMenu}
          onOpenSettings={() => setIsSettingsOpen(true)}
          audioRef={audioRef}
          playerProfile={playerProfile}
          updateProfile={updateProfile}
          settings={settings}
        />
      )}

      {gameState !== 'login' && gameState !== 'ai-assistant' && (
        <button
          onClick={openAiAssistant}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1200,
            border: 'none',
            borderRadius: 999,
            padding: '12px 16px',
            fontWeight: 700,
            cursor: 'pointer',
            color: '#f8fafc',
            background: 'linear-gradient(135deg, #0284c7, #0f172a)',
            boxShadow: '0 12px 26px rgba(0,0,0,0.35)'
          }}
        >
          🤖 Hỏi AI
        </button>
      )}
    </div>
  )
}

export default App
