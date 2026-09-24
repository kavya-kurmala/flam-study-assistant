import { useState } from 'react'

export default function PromptInput({ onSubmit, disabled, defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label htmlFor="topic-input">Notes or topic</label>
      <textarea
        id="topic-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Paste your biology notes on cell respiration, or just type a topic like 'the French Revolution'"
        rows={6}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        {disabled ? 'Generating…' : 'Generate flashcards'}
      </button>
    </form>
  )
}
