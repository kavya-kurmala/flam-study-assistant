import { useState } from 'react'

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function FlashcardDeck({ cards }) {
  const [order, setOrder] = useState(cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = order[index]

  const goNext = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % order.length)
  }
  const goPrev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + order.length) % order.length)
  }
  const handleShuffle = () => {
    setOrder(shuffle(cards))
    setIndex(0)
    setFlipped(false)
  }

  if (!current) return null

  return (
    <div className="flashcard-deck">
      <p className="progress">
        {index + 1} / {order.length}
      </p>

      <button
        className={`flashcard ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label="Flip card"
      >
        <span className="flashcard-label">{flipped ? 'Answer' : 'Question'}</span>
        <span className="flashcard-text">{flipped ? current.answer : current.question}</span>
        <span className="flashcard-hint">Tap to flip</span>
      </button>

      <div className="deck-controls">
        <button onClick={goPrev}>← Prev</button>
        <button onClick={handleShuffle}>Shuffle</button>
        <button onClick={goNext}>Next →</button>
      </div>
    </div>
  )
}
