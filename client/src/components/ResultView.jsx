import { useState } from 'react'
import FlashcardDeck from './FlashcardDeck.jsx'
import QuizView from './QuizView.jsx'

export default function ResultView({ cards, topic, onReset }) {
  const [mode, setMode] = useState('flashcards')

  return (
    <div className="result-view">
      <div className="result-header">
        <div>
          <h2>{topic}</h2>
          <p className="result-count">{cards.length} cards</p>
        </div>
        <button className="ghost-button" onClick={onReset}>
          Start over
        </button>
      </div>

      <div className="mode-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'flashcards'}
          className={mode === 'flashcards' ? 'active' : ''}
          onClick={() => setMode('flashcards')}
        >
          Flashcards
        </button>
        <button
          role="tab"
          aria-selected={mode === 'quiz'}
          className={mode === 'quiz' ? 'active' : ''}
          onClick={() => setMode('quiz')}
        >
          Quiz
        </button>
      </div>

      {mode === 'flashcards' ? <FlashcardDeck cards={cards} /> : <QuizView cards={cards} />}
    </div>
  )
}
