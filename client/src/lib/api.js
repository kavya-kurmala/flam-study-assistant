const ERROR_MESSAGES = {
  failed_request: "Couldn't reach the server. Check your connection and try again.",
  timeout: 'The request took too long and timed out. Try again.',
  malformed_json: "The AI's response wasn't valid JSON.",
  wrong_shape: "The AI's response didn't match the expected format.",
  empty: 'The AI returned no flashcards. Try rephrasing your topic.',
  unknown: 'Something went wrong. Please try again.',
}

export class ApiError extends Error {
  constructor(type, message) {
    super(message || ERROR_MESSAGES[type] || ERROR_MESSAGES.unknown)
    this.type = type
  }
}

// The frontend never calls the LLM directly — it only ever talks to our
// own backend, which holds the API key.
export async function generateStudySet(topic, { signal } = {}) {
  let response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('failed_request')
  }

  let envelope
  try {
    envelope = await response.json()
  } catch {
    throw new ApiError('malformed_json')
  }

  if (!response.ok || envelope.ok === false) {
    const type = envelope?.error || 'failed_request'
    throw new ApiError(type, envelope?.message)
  }

  return envelope.data
}

export { ERROR_MESSAGES }
