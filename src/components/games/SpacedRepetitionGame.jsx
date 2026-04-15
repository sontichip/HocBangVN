import { useMemo, useState } from 'react'

const PASSING_RATIO = 0.6

export default function SpacedRepetitionGame({ cards, onComplete, disabled }) {
  const initialDeck = useMemo(
    () =>
      (cards || [])
        .map((card) => ({
          front: `${card?.front || card?.term || ''}`.trim(),
          back: `${card?.back || card?.definition || ''}`.trim()
        }))
        .filter((card) => card.front && card.back),
    [cards]
  )

  const [queue, setQueue] = useState(initialDeck)
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [stats, setStats] = useState({ right: 0, wrong: 0 })

  const current = queue[index]

  const finalize = (nextStats) => {
    const total = nextStats.right + nextStats.wrong
    const ratio = total === 0 ? 0 : nextStats.right / total
    onComplete({
      success: ratio >= PASSING_RATIO,
      message: `Bạn nhớ đúng ${nextStats.right}/${total} thẻ.`
    })
  }

  const markCard = (isCorrect) => {
    if (disabled || !current) return
    const nextStats = {
      right: stats.right + (isCorrect ? 1 : 0),
      wrong: stats.wrong + (isCorrect ? 0 : 1)
    }
    setStats(nextStats)

    if (!isCorrect) {
      const nextQueue = [...queue]
      nextQueue.push(current)
      setQueue(nextQueue)
    }

    const nextIndex = index + 1
    setShowBack(false)
    if (nextIndex >= queue.length) {
      finalize(nextStats)
      return
    }
    setIndex(nextIndex)
  }

  if (!current) {
    return (
      <div>
        <p>Không có thẻ để ôn tập.</p>
        <button className="submit-btn" onClick={() => onComplete({ success: false, message: 'Không có dữ liệu thẻ.' })}>
          Kết thúc
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ opacity: 0.8 }}>
        Thẻ {index + 1}/{queue.length} · Đúng {stats.right} · Sai {stats.wrong}
      </div>
      <button
        type="button"
        onClick={() => setShowBack((s) => !s)}
        disabled={disabled}
        style={{ borderRadius: 12, padding: 14, minHeight: 88 }}
      >
        <strong>{showBack ? current.back : current.front}</strong>
        <div style={{ marginTop: 8, opacity: 0.75 }}>{showBack ? 'Mặt nghĩa' : 'Mặt từ vựng'}</div>
      </button>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="submit-btn" type="button" onClick={() => markCard(false)} disabled={disabled}>
          ❌ Chưa nhớ
        </button>
        <button className="submit-btn" type="button" onClick={() => markCard(true)} disabled={disabled}>
          ✅ Đã nhớ
        </button>
      </div>
    </div>
  )
}
