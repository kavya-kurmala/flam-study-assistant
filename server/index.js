import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateStudySet } from './lib/llmClient.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.post('/api/generate', async (req, res) => {
  const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : ''

  if (!topic) {
    return res
      .status(400)
      .json({ ok: false, error: 'wrong_shape', message: 'A topic or notes are required.' })
  }
  if (topic.length > 6000) {
    return res
      .status(400)
      .json({ ok: false, error: 'wrong_shape', message: 'That input is too long — try trimming it.' })
  }

  try {
    const data = await generateStudySet(topic)
    return res.json({ ok: true, data })
  } catch (err) {
    const type = err.type || 'failed_request'
    const status = type === 'config' ? 500 : 502
    console.error(`[generate] ${type}:`, err.message)
    return res
      .status(status)
      .json({ ok: false, error: type === 'config' ? 'failed_request' : type, message: err.message })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Study Assistant backend running on http://localhost:${PORT}`)
})
