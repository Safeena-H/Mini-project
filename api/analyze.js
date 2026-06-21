// Vercel serverless function — calls Groq AI to analyze student notes
// Groq is free and gives standard API keys that work server-side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, content } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on server' })
  }

  const prompt = `You are a study assistant helping a student revise their notes.
Analyze the following student note and respond with ONLY a valid JSON object — no markdown, no explanation, no extra text.

Note Title: ${title}
Note Content: ${content}

Respond with exactly this JSON format:
{
  "summary": "A clear 2-3 sentence summary of the most important ideas in this note",
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"]
}`

  try {
    // Groq uses OpenAI-compatible API format
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.error?.message || 'Groq API request failed')
    }

    const data = await response.json()

    // Groq returns the text inside choices[0].message.content
    const raw = data.choices?.[0]?.message?.content?.trim()

    if (!raw) throw new Error('Empty response from Groq')

    return res.status(200).json(JSON.parse(raw))
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Analysis failed' })
  }
}
