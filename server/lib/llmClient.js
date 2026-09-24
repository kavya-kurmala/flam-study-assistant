import { buildPrompt } from './prompt.js'

const REQUEST_TIMEOUT_MS = 25000

// Models sometimes wrap valid JSON in prose or code fences despite
// instructions not to. Try a straight parse first, then fall back to
// extracting the outermost { ... } block before giving up.
function extractJson(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    // fall through to extraction
  }
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
}

export async function generateStudySet(topic) {
  const { API_BASE_URL, API_KEY, MODEL } = process.env

  if (!API_BASE_URL || !API_KEY || !MODEL) {
    const err = new Error('Server is missing API_BASE_URL, API_KEY, or MODEL in .env')
    err.type = 'config'
    throw err
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You return only valid JSON. Never include prose or markdown fences.',
          },
          { role: 'user', content: buildPrompt(topic) },
        ],
      }),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('LLM request timed out')
      e.type = 'timeout'
      throw e
    }
    const e = new Error('Failed to reach LLM provider')
    e.type = 'failed_request'
    throw e
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const e = new Error(`LLM provider returned ${response.status}: ${text.slice(0, 200)}`)
    e.type = 'failed_request'
    throw e
  }

  const payload = await response.json()
  const rawText = payload?.choices?.[0]?.message?.content

  if (!rawText || !rawText.trim()) {
    const e = new Error('LLM returned an empty response')
    e.type = 'empty'
    throw e
  }

  const parsed = extractJson(rawText.trim())
  if (!parsed) {
    const e = new Error('LLM response was not valid JSON')
    e.type = 'malformed_json'
    throw e
  }

  // Note: this only confirms it's parseable JSON. Structural validation
  // (right fields, right types) happens on the client in validateResult.js,
  // which is the layer that decides what's actually safe to render.
  return parsed
}
