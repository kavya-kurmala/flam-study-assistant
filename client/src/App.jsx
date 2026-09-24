import { useCallback, useRef, useState } from 'react'
import PromptInput from './components/PromptInput.jsx'
import LoadingState from './components/LoadingState.jsx'
import ErrorState from './components/ErrorState.jsx'
import ResultView from './components/ResultView.jsx'
import { generateStudySet, ApiError } from './lib/api.js'
import { validateResult, normalizeCards } from './lib/validateResult.js'
import './App.css'

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
}

const REQUEST_TIMEOUT_MS = 30000

export default function App() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [errorType, setErrorType] = useState(null)
  const [cards, setCards] = useState(null)
  const [lastTopic, setLastTopic] = useState('')

  // Guards against a slow, stale request overwriting a newer result.
  const requestId = useRef(0)
  const abortRef = useRef(null)

  const runGenerate = useCallback(async (topic) => {
    // Cancel any in-flight request before starting a new one.
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const id = ++requestId.current
    setStatus(STATUS.LOADING)
    setErrorType(null)
    setLastTopic(topic)

    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const data = await generateStudySet(topic, { signal: controller.signal })

      // A newer request has since started — drop this stale result.
      if (id !== requestId.current) return

      const validation = validateResult(data)
      if (!validation.valid) {
        setStatus(STATUS.ERROR)
        setErrorType(validation.reason)
        return
      }

      setCards(normalizeCards(data))
      setStatus(STATUS.SUCCESS)
    } catch (err) {
      if (id !== requestId.current) return // stale — ignore

      if (err.name === 'AbortError') {
        setStatus(STATUS.ERROR)
        setErrorType('timeout')
        return
      }

      setStatus(STATUS.ERROR)
      setErrorType(err instanceof ApiError ? err.type : 'unknown')
    } finally {
      clearTimeout(timeoutId)
    }
  }, [])

  const handleReset = () => {
    requestId.current++ // invalidate any in-flight request
    if (abortRef.current) abortRef.current.abort()
    setStatus(STATUS.IDLE)
    setErrorType(null)
    setCards(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Study Assistant</h1>
        <p>Paste your notes or a topic. Get flashcards and a quiz.</p>
      </header>

      <main className="app-main">
        {status !== STATUS.SUCCESS && (
          <PromptInput
            onSubmit={runGenerate}
            disabled={status === STATUS.LOADING}
            defaultValue={lastTopic}
          />
        )}

        {status === STATUS.LOADING && <LoadingState />}

        {status === STATUS.ERROR && (
          <ErrorState errorType={errorType} onRetry={() => runGenerate(lastTopic)} />
        )}

        {status === STATUS.SUCCESS && cards && (
          <ResultView cards={cards} topic={lastTopic} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}
