// Structural validation of whatever the backend handed back. The backend
// only guarantees "this parsed as JSON" — it's the frontend's job to check
// the shape actually matches what the UI needs before rendering anything.
export function validateResult(data) {
  if (!data || typeof data !== 'object') return { valid: false, reason: 'wrong_shape' }
  if (!Array.isArray(data.cards)) return { valid: false, reason: 'wrong_shape' }
  if (data.cards.length === 0) return { valid: false, reason: 'empty' }

  for (const card of data.cards) {
    if (typeof card !== 'object' || card === null) return { valid: false, reason: 'wrong_shape' }
    if (typeof card.question !== 'string' || !card.question.trim()) {
      return { valid: false, reason: 'wrong_shape' }
    }
    if (typeof card.answer !== 'string' || !card.answer.trim()) {
      return { valid: false, reason: 'wrong_shape' }
    }
    if (!Array.isArray(card.options) || card.options.length < 2) {
      return { valid: false, reason: 'wrong_shape' }
    }
    const hasAnswerInOptions = card.options.some(
      (o) => typeof o === 'string' && o.trim() === card.answer.trim(),
    )
    if (!hasAnswerInOptions) return { valid: false, reason: 'wrong_shape' }
  }

  return { valid: true }
}

// Only called after validateResult confirms the shape is safe to trust.
export function normalizeCards(data) {
  return data.cards.map((card, i) => ({
    id: card.id ? String(card.id) : `card-${i}`,
    question: card.question.trim(),
    answer: card.answer.trim(),
    options: card.options.map((o) => String(o).trim()),
  }))
}
