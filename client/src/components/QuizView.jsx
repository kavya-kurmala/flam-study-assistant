import { useMemo, useState } from 'react'

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function QuizView({ cards }) {
  const [pool, setPool] = useState(cards)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [wrongCards, setWrongCards] = useState([])
  const [finished, setFinished] = useState(false)

  const current = pool[index]
  // Re-shuffle option order per question, not per render.
  const shuffledOptions = useMemo(() => (current ? shuffle(current.options) : []), [current])

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    if (option === current.answer) {
      setScore((s) => s + 1)
    } else {
      setWrongCards((w) => [...w, current])
    }
  }

  const handleNext = () => {
    setSelected(null)
    if (index + 1 >= pool.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  const handleRetestWrong = () => {
    setPool(wrongCards)
    setWrongCards([])
    setScore(0)
    setIndex(0)
    setSelected(null)
    setFinished(false)
  }

  const handleRestartAll = () => {
    setPool(cards)
    setWrongCards([])
    setScore(0)
    setIndex(0)
    setSelected(null)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="quiz-summary">
        <h3>
          Score: {score} / {pool.length}
        </h3>
        {wrongCards.length > 0 ? (
          <>
            <p>{wrongCards.length} to review.</p>
            <button onClick={handleRetestWrong}>Retest wrong answers</button>
          </>
        ) : (
          <p>Perfect run! 🎉</p>
        )}
        <button className="ghost-button" onClick={handleRestartAll}>
          Restart full quiz
        </button>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="quiz-view">
      <p className="progress">
        {index + 1} / {pool.length} · Score: {score}
      </p>
      <h3 className="quiz-question">{current.question}</h3>

      <div className="quiz-options">
        {shuffledOptions.map((option) => {
          const isSelected = selected === option
          const isAnswer = option === current.answer
          let className = 'quiz-option'
          if (selected) {
            if (isAnswer) className += ' correct'
            else if (isSelected) className += ' incorrect'
          }
          return (
            <button
              key={option}
              className={className}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
            >
              {option}
            </button>
          )
        })}
      </div>

      {selected && (
        <button className="next-button" onClick={handleNext}>
          {index + 1 >= pool.length ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  )
}
