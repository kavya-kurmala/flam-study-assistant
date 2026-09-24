// One message per failure mode called out in the assignment: malformed JSON,
// wrong shape, empty response, timeout, and failed request.
const MESSAGES = {
  failed_request: {
    title: "Couldn't reach the server",
    body: 'Check your connection, or that the backend is running, then try again.',
  },
  timeout: {
    title: 'That took too long',
    body: 'The request timed out after 30 seconds. Try again, or try a shorter topic.',
  },
  malformed_json: {
    title: 'Unreadable response',
    body: "The AI didn't return valid JSON that time. This can happen — try again.",
  },
  wrong_shape: {
    title: "Response wasn't usable",
    body: "The AI's response was missing fields we need. Try again or rephrase your topic.",
  },
  empty: {
    title: 'No flashcards generated',
    body: 'Try a more specific topic, or paste in some actual notes.',
  },
  unknown: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred. Please try again.',
  },
}

export default function ErrorState({ errorType, onRetry }) {
  const { title, body } = MESSAGES[errorType] || MESSAGES.unknown
  return (
    <div className="state-box error-state" role="alert">
      <h3>{title}</h3>
      <p>{body}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}
