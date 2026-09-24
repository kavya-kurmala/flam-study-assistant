export function buildPrompt(topic) {
  return `You generate study flashcards. Return ONLY valid JSON, no markdown code fences, no commentary, no prose before or after.

Shape (exactly):
{
  "cards": [
    {
      "id": string,
      "question": string,
      "answer": string,
      "options": string[]
    }
  ]
}

Rules:
- Generate 8 to 12 cards based on the notes or topic below.
- "answer" must be a short, exact answer (a few words to one sentence).
- "options" must contain exactly 4 strings: the exact "answer" text plus 3 plausible but incorrect distractors, in random order.
- Keep questions and answers concise and clear.
- Do not include any text outside the JSON object.

Notes or topic:
"""
${topic}
"""`
}
