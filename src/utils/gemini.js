// calls our Vercel serverless function at /api/analyze
// the server function talks to Gemini — the API key never touches the browser
export const analyzeNote = async (title, content) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Analysis failed')
  }

  // returns { summary: '...', keyConcepts: [...] }
  return data
}
