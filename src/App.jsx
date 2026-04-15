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
  const [uploadApiBase, setUploadApiBase] = useState('')
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

  // Load auth token / upload base from localStorage
  useEffect(() => {
    try {
      const a = localStorage.getItem('hocbang_vn_auth')
      if (a) {
        const parsed = JSON.parse(a)
        if (parsed.token) setAuthToken(parsed.token)
        if (parsed.base) setUploadApiBase(parsed.base)
        if (parsed.username) setUsername(parsed.username)
      }
    } catch (e) {}
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

  // Persist auth info when it changes
  useEffect(() => {
    try {
      const data = { token: authToken || '', base: uploadApiBase || '', username }
      localStorage.setItem('hocbang_vn_auth', JSON.stringify(data))
    } catch (e) {}
  }, [authToken, uploadApiBase, username])

  const handleBackToMenu = () => {
    setGameState('lesson-select')
    setCurrentLessonIdx(null)
  }

  const handleSelectMode = async (mode, inputUsername, authData) => {
    let finalUsername = (inputUsername || '').trim()
    if (!finalUsername) {
      finalUsername = 'Guest'
    }
    setUsername(finalUsername)

    // If authData provided (from OAuth popup), set upload base and token immediately
    if (authData && authData.token) {
      setUploadApiBase(authData.base || '')
      setAuthToken(authData.token)
      try {
        localStorage.setItem('hocbang_vn_auth', JSON.stringify({ token: authData.token, base: authData.base || '', username: authData.username || username }))
      } catch (e) {}
    }
    if (mode === 'upload-ai') {
      try {
        const configuredBase = import.meta.env.VITE_UPLOAD_API_BASE
        const candidates = [configuredBase, 'http://localhost:5188', 'http://localhost:5174', 'http://localhost:5175']
          .filter(Boolean)
          .filter((value, idx, arr) => arr.indexOf(value) === idx)

        let selected = null
        for (const base of candidates) {
          try {
            const res = await fetch(`${base}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: finalUsername })
            })
            if (!res.ok) continue
            const data = await res.json()
            if (data?.token) {
              selected = { base, token: data.token }
              break
            }
          } catch (err) {
            // Try next candidate when a host/port is unavailable.
          }
        }

        if (!selected) {
          // don't block the user: allow entering upload UI in offline mode
          setUploadApiBase('')
          setAuthToken('')
          setLastNonAiState('upload')
          setGameState('upload')
          return
        }

        setUploadApiBase(selected.base)
        setAuthToken(selected.token)
        setLastNonAiState('upload')
        setGameState('upload')
      } catch (e) {
        // allow user to proceed even if login fails
        setUploadApiBase('')
        setAuthToken('')
        setLastNonAiState('upload')
        setGameState('upload')
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
      <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 40 }}>
        {username ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: '#2e7d32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {String(username).charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#083325' }}>{username}</div>
              {authToken && <div style={{ fontSize: 11, color: '#4b6b5a' }}>{uploadApiBase ? new URL(uploadApiBase).host : 'connected'}</div>}
            </div>
          </div>
        ) : null}
        {authToken ? (
          <button onClick={() => {
            setAuthToken('')
            setUploadApiBase('')
            setUsername('')
            localStorage.removeItem('hocbang_vn_auth')
            setGameState('login')
          }} style={{ marginLeft: 8, background: '#fff', border: '1px solid #cfeee1', color: '#0b6b3a', padding: '6px 8px', borderRadius: 8, cursor: 'pointer' }}>Đăng xuất</button>
        ) : null}
      </div>
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
        <UserContentScreen onBack={() => setGameState('login')} token={authToken} apiBase={uploadApiBase} />
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
            color: '#012224',
            background: 'linear-gradient(135deg, #2bb7d9, #0284c7)',
            boxShadow: '0 10px 20px rgba(3,50,64,0.12)'
          }}
        >
          🤖 Hỏi AI
        </button>
      )}
    </div>
  )
}

export default App
