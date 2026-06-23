// Vercel serverless function — generates 5 MCQ questions from a note using Groq AI
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, content } = req.body
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' })
  }

  const prompt = `Generate exactly 5 multiple choice quiz questions based on this student note. Each question must have exactly 4 options.

Note Title: ${title}
Note Content: ${content}

Respond with ONLY a valid JSON object — no markdown, no explanation, no extra text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "answer": 0
    }
  ]
}

The "answer" field must be the index (0, 1, 2, or 3) of the correct option in the options array.
Make questions that test understanding of the content, not just memorization.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        // slightly higher temperature for more varied questions
        temperature: 0.4,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.error?.message || 'Groq API request failed')
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) throw new Error('Empty response from Groq')

    return res.status(200).json(JSON.parse(raw))
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Quiz generation failed' })
  }
}
