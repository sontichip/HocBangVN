// Quản lý state tiến trình học, lesson, điểm, unlock
import { useState } from "react";
import { lessons } from "../lessons";

export function useGameState() {
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [vnStep, setVnStep] = useState(0); // visual novel step
  const [miniGameIdx, setMiniGameIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [unlockedLessons, setUnlockedLessons] = useState([0]);
  const [finished, setFinished] = useState(false);

  const lesson = lessons[currentLessonIdx];
  const vnNode = lesson.visualNovel[vnStep];
  const miniGame = lesson.miniGames[miniGameIdx];

  function nextVnStep(nextId) {
    const idx = lesson.visualNovel.findIndex(n => n.id === nextId);
    if (idx !== -1) setVnStep(idx);
    else setFinished(true);
  }

  function nextMiniGame(correct) {
    if (correct) setScore(s => s + 1);
    if (miniGameIdx + 1 < lesson.miniGames.length) {
      setMiniGameIdx(i => i + 1);
    } else {
      // Kết thúc lesson
      if (score + (correct ? 1 : 0) >= lesson.passScore) {
        // Unlock bài tiếp theo nếu có
        if (currentLessonIdx + 1 < lessons.length && !unlockedLessons.includes(currentLessonIdx + 1)) {
          setUnlockedLessons([...unlockedLessons, currentLessonIdx + 1]);
        }
      }
      setFinished(true);
    }
  }

  function resetLesson(idx) {
    setCurrentLessonIdx(idx);
    setVnStep(0);
    setMiniGameIdx(0);
    setScore(0);
    setFinished(false);
  }

  return {
    lesson,
    vnNode,
    miniGame,
    vnStep,
    miniGameIdx,
    score,
    unlockedLessons,
    finished,
    nextVnStep,
    nextMiniGame,
    resetLesson,
    setCurrentLessonIdx
  };
}
