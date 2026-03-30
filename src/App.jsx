import { useState } from 'react'
import VisualNovelScreen from './components/VisualNovelScreen'
import MainMenu from './components/MainMenu'
import LessonSelector from './components/LessonSelector'
import { lessons } from './lessons'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('menu') // menu, lesson-select, playing
  const [currentLessonIdx, setCurrentLessonIdx] = useState(null)

  const handleStartGame = () => {
    setGameState('lesson-select')
  }

  const handleSelectLesson = (lessonIdx) => {
    setCurrentLessonIdx(lessonIdx)
    setGameState('playing')
  }

  const handleBackToMenu = () => {
    setGameState('menu')
    setCurrentLessonIdx(null)
  }

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu onStart={handleStartGame} />}
      {gameState === 'lesson-select' && (
        <LessonSelector
          lessons={lessons}
          onSelectLesson={handleSelectLesson}
          onBack={handleBackToMenu}
        />
      )}
      {gameState === 'playing' && currentLessonIdx !== null && lessons[currentLessonIdx] && (
        <VisualNovelScreen lesson={lessons[currentLessonIdx]} onBack={handleBackToMenu} />
      )}
    </div>
  )
}

export default App
