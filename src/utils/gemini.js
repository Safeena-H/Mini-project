// Gemini API helper — uses the official Google AI SDK which handles all key formats
// The API key is stored in .env.local as VITE_GEMINI_API_KEY
import { GoogleGenerativeAI } from '@google/generative-ai'

export const analyzeNote = async (title, content) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in .env.local')
  }

  // GoogleGenerativeAI handles authentication automatically for all key types
  const genAI = new GoogleGenerativeAI(apiKey)

  // gemini-1.5-flash is fast and free on the AI Studio free tier
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    // temperature 0.2 keeps responses factual and consistent
    generationConfig: { temperature: 0.2 },
  })

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

  const result = await model.generateContent(prompt)

  // getText() returns the raw text from Gemini's response
  const raw = result.response.text().trim()

  if (!raw) throw new Error('Empty response from Gemini')

  // parse the JSON string Gemini returned
  return JSON.parse(raw)
}
