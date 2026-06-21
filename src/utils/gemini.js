// Gemini API helper — sends note content and gets back summary + key concepts
// The API key is stored in .env.local as VITE_GEMINI_API_KEY
// Vite exposes env variables that start with VITE_ to the browser via import.meta.env

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export const analyzeNote = async (title, content) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in .env.local')
  }

  // the prompt tells Gemini exactly what format to respond in
  // asking for JSON directly avoids having to parse messy text
  const prompt = `You are a study assistant helping a student revise their notes.
Analyze the following student note and respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.

Note Title: ${title}
Note Content: ${content}

Respond with exactly this JSON format:
{
  "summary": "A clear 2-3 sentence summary of the most important ideas in this note",
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"]
}`

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      // temperature 0.2 keeps responses factual and consistent
      generationConfig: { temperature: 0.2 },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'Gemini API request failed')
  }

  const data = await response.json()

  // Gemini returns the text inside candidates[0].content.parts[0].text
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

  if (!raw) throw new Error('Empty response from Gemini')

  // parse the JSON string Gemini returned
  return JSON.parse(raw)
}
