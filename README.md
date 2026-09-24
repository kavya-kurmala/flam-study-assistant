# Study Assistant

A small React app for the Flam frontend internship assignment. You paste in
notes or a topic, the app sends it to an LLM through a small backend proxy,
and the response — structured JSON, not chat text — becomes a flippable
flashcard deck and a multiple-choice quiz with score tracking and
"retest wrong answers."

> **Before you submit:** this scaffold was built with Claude's help, per
> your own honest starting point. Read through every file, run it, break it,
> and change things until you can explain and extend all of it live in the
> interview — that's an explicit requirement of the assignment. Don't submit
> code you don't understand. See "What to actually check/change" below.

## Quick start

Requires Node 18+ (for built-in `fetch`).

```bash
# 1. Install dependencies in both halves
cd server && npm install
cd ../client && npm install

# 2. Configure your LLM provider
cd ../server
cp .env.example .env
# edit .env: set API_BASE_URL, API_KEY, MODEL (see comments in the file
# for OpenAI / OpenRouter / Groq / local Ollama examples)

# 3. Run both (two terminals)
# terminal 1
cd server && npm run dev
# terminal 2
cd client && npm run dev
```

Or, from the repo root, `npm install` then `npm run dev` runs both via
`concurrently`.

Open the client's dev URL (Vite will print it, typically
`http://localhost:5173`). The Vite dev server proxies `/api/*` requests to
the backend on port 3001, so the frontend never needs to know the backend's
port directly.

## How it's structured

```
flam-study-assistant/
├── client/                    # React app (Vite)
│   └── src/
│       ├── components/
│       │   ├── PromptInput.jsx      # free-form text input
│       │   ├── ResultView.jsx       # tabs between flashcards / quiz
│       │   ├── FlashcardDeck.jsx    # flip, shuffle, next/prev
│       │   ├── QuizView.jsx         # multiple choice, score, retest wrong
│       │   ├── LoadingState.jsx
│       │   └── ErrorState.jsx       # one message per failure mode
│       ├── lib/
│       │   ├── api.js               # the ONLY place that calls the backend
│       │   └── validateResult.js    # structural check before rendering
│       ├── types/result.js          # JSDoc shape reference
│       └── App.jsx                  # state machine + stale-request guard
└── server/                    # Express backend (holds the API key)
    ├── index.js                     # /api/generate route
    └── lib/
        ├── prompt.js                # the strict JSON-only prompt
        └── llmClient.js             # calls the LLM, timeout + JSON extraction
```

## The data shape

```json
{
  "cards": [
    {
      "id": "c1",
      "question": "What is the powerhouse of the cell?",
      "answer": "The mitochondria",
      "options": ["The mitochondria", "The nucleus", "The ribosome", "The golgi apparatus"]
    }
  ]
}
```

One shape serves both views: `question`/`answer` drive the flashcard flip,
and `options` (which always includes the exact `answer` text plus three
distractors) drives the quiz without a second AI call.

## Error handling

The backend does a first-pass JSON parse (including pulling a `{...}` block
out of a response that wraps JSON in prose, since models don't always follow
instructions). The frontend's `validateResult.js` does **not** trust that —
it independently checks the shape (array of cards, required string fields,
answer present in options) before anything reaches a component. Every
failure mode from the assignment maps to a distinct, visible state in
`ErrorState.jsx`:

- malformed JSON
- wrong shape (valid JSON, missing/wrong fields)
- empty response
- timeout (25s on the server call, 30s end-to-end)
- failed request (network / non-2xx from the provider)

`App.jsx` also guards against **stale responses**: each request gets an
incrementing `requestId`, and a result is only applied if its id still
matches the latest request when it resolves. Starting a new request also
aborts any request still in flight.

## AI usage note

_(Fill this in honestly before submitting — the assignment specifically
rewards being upfront about it.)_

- What you used AI for:
- What you changed, removed, or rewrote yourself:
- What you had AI explain to you that you didn't already know:

## Known limitations

- No streaming — the full result arrives at once (listed as a stretch goal,
  not implemented).
- No session save/reload — refreshing loses the current deck.
- The quiz always uses 4 options because the prompt asks for exactly 4;
  a model that ignores this could return fewer, which `validateResult.js`
  will catch and route to the "wrong shape" error state.
- No automated tests.

## Time spent

_(Fill in honestly.)_

## What to actually check/change before you submit

This is a scaffold, not a finished, personally-understood submission. At minimum:
- Run it end-to-end with your own API key and read the actual model output —
  the prompt in `server/lib/prompt.js` may need tuning for your provider.
- Read `App.jsx`'s state machine and the stale-request guard until you could
  redraw it from memory — you'll likely be asked to explain exactly this.
- Decide if you want to change the visual design, add a stretch goal, or
  restructure anything — make it yours.
- Write the AI-usage note and time-spent section above for real.
