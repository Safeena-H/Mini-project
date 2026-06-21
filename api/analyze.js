// Vercel serverless function — runs on the server, not in the browser
// This is why the API key works here even though it doesn't work client-side
import { GoogleGenerativeAI } from '@google/generative-ai'

export default async function handler(req, res) {
  // only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, content } = req.body

  // process.env works on the server — no VITE_ prefix needed here
  const apiKey = process.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.2 },
    })

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
    const raw = result.response.text().trim()

    // parse Gemini's JSON response and send it back to the browser
    return res.status(200).json(JSON.parse(raw))
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gemini API failed' })
  }
}
