import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotes, saveScore } from '../utils/localStorage'
import './Quiz.css'

const Quiz = () => {
  const navigate = useNavigate()

  // all notes the student has saved — shown in the dropdown
  const [notes, setNotes] = useState([])

  // which note the student picked from the dropdown
  const [selectedNoteId, setSelectedNoteId] = useState('')

  // controls which screen is shown:
  // 'select' → pick note  |  'loading' → AI generating  |  'quiz' → answering  |  'result' → score
  const [step, setStep] = useState('select')

  // array of { question, options, answer } objects from Groq
  const [questions, setQuestions] = useState([])

  // index of the question currently on screen (0 to 4)
  const [currentQ, setCurrentQ] = useState(0)

  // stores what the student chose for each question — null means not answered yet
  const [userAnswers, setUserAnswers] = useState([])

  // error message shown under the generate button
  const [error, setError] = useState('')

  // load notes when page opens
  useEffect(() => {
    setNotes(getNotes())
  }, [])

  // find the full note object for the selected id
  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // calls the /api/quiz serverless function to generate questions
  const handleGenerate = async () => {
    if (!selectedNote) return
    setStep('loading')
    setError('')

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedNote.title, content: selectedNote.content }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz')

      setQuestions(data.questions)
      // fill answers array with null — one slot per question
      setUserAnswers(new Array(data.questions.length).fill(null))
      setCurrentQ(0)
      setStep('quiz')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('select')
    }
  }

  // called when student clicks one of the 4 option buttons
  const handleSelectAnswer = (optionIndex) => {
    const updated = [...userAnswers]
    updated[currentQ] = optionIndex
    setUserAnswers(updated)
  }

  // moves to the next question
  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    }
  }

  // called when student submits the last question
  const handleSubmit = () => {
    // count how many answers match the correct answer index
    const correct = questions.filter((q, i) => userAnswers[i] === q.answer).length
    // convert to percentage — round to nearest whole number
    const scorePercent = Math.round((correct / questions.length) * 100)

    // save to localStorage so score dashboard can read it
    saveScore({
      id: Date.now().toString(),
      score: scorePercent,
      correct,
      total: questions.length,
      subject: selectedNote.subject,
      noteTitle: selectedNote.title,
      date: new Date().toISOString(),
    })

    setStep('result')
  }

  // resets everything so student can quiz again
  const handleRetake = () => {
    setStep('select')
    setSelectedNoteId('')
    setQuestions([])
    setUserAnswers([])
    setCurrentQ(0)
    setError('')
  }

  // determines the color class for each result item
  const isCorrect = (i) => userAnswers[i] === questions[i].answer

  // total correct answers for the result screen
  const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

  // color of the score circle — green 80+, orange 50-79, red below 50
  const scoreColor = scorePercent >= 80 ? 'green' : scorePercent >= 50 ? 'orange' : 'red'

  return (
    <div className="quiz-page">
      <div className="container py-4">
        <div className="col-lg-7 mx-auto">

          {/* ── SELECT NOTE STEP ── */}
          {step === 'select' && (
            <>
              <div className="quiz-header mb-4">
                <h2 className="quiz-title">Take a Quiz</h2>
                <p className="quiz-subtitle">
                  Select a note and let AI generate 5 questions to test your understanding
                </p>
              </div>

              <div className="quiz-card">
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-journal-text me-1 text-purple"></i> Select a Note
                  </label>

                  {notes.length === 0 ? (
                    // student has no notes yet — show message
                    <div className="quiz-empty">
                      <i className="bi bi-journal-plus quiz-empty__icon"></i>
                      <p>You don't have any notes yet. Add a note first!</p>
                      <button className="btn sb-btn-primary" onClick={() => navigate('/add-note')}>
                        <i className="bi bi-plus-lg me-2"></i>Add a Note
                      </button>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedNoteId}
                      onChange={(e) => setSelectedNoteId(e.target.value)}
                    >
                      <option value="">Choose a note to quiz from...</option>
                      {notes.map((note) => (
                        <option key={note.id} value={note.id}>
                          {note.title} — {note.subject}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* AI tip box */}
                <div className="quiz-tip mb-4">
                  <i className="bi bi-stars me-2"></i>
                  AI will read your note and create 5 questions to test your knowledge
                </div>

                {/* error from previous attempt */}
                {error && <p className="quiz-error mb-3">{error}</p>}

                <button
                  className="btn sb-btn-primary w-100 justify-content-center"
                  onClick={handleGenerate}
                  disabled={!selectedNoteId}
                >
                  <i className="bi bi-patch-question me-2"></i>Generate Quiz
                </button>
              </div>
            </>
          )}

          {/* ── LOADING STEP ── */}
          {step === 'loading' && (
            <div className="quiz-card quiz-loading">
              <div className="quiz-loading__spinner">
                <div className="spinner-border text-purple" role="status" style={{ width: '3rem', height: '3rem' }} />
              </div>
              <h5 className="quiz-loading__title">Generating your quiz...</h5>
              <p className="quiz-loading__subtitle">
                AI is reading your note on <strong>{selectedNote?.title}</strong> and writing 5 questions
              </p>
            </div>
          )}

          {/* ── QUIZ STEP ── */}
          {step === 'quiz' && questions.length > 0 && (
            <>
              {/* progress bar */}
              <div className="quiz-progress mb-4">
                <div className="quiz-progress__labels">
                  <span>Question {currentQ + 1} of {questions.length}</span>
                  <span className="quiz-progress__subject">{selectedNote?.subject}</span>
                </div>
                {/* width is calculated as percentage of questions answered */}
                <div className="quiz-progress__bar">
                  <div
                    className="quiz-progress__fill"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="quiz-card">
                {/* question text */}
                <h5 className="quiz-question">{questions[currentQ].question}</h5>

                {/* 4 option buttons */}
                <div className="quiz-options">
                  {questions[currentQ].options.map((option, i) => (
                    <button
                      key={i}
                      // quiz-option--selected highlights the chosen answer
                      className={`quiz-option ${userAnswers[currentQ] === i ? 'quiz-option--selected' : ''}`}
                      onClick={() => handleSelectAnswer(i)}
                    >
                      {/* A, B, C, D labels */}
                      <span className="quiz-option__letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="quiz-option__text">{option}</span>
                    </button>
                  ))}
                </div>

                {/* Next or Submit button — disabled if no answer selected */}
                <div className="d-flex justify-content-end mt-4">
                  {currentQ < questions.length - 1 ? (
                    <button
                      className="btn sb-btn-primary"
                      onClick={handleNext}
                      disabled={userAnswers[currentQ] === null}
                    >
                      Next <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  ) : (
                    <button
                      className="btn sb-btn-primary"
                      onClick={handleSubmit}
                      disabled={userAnswers[currentQ] === null}
                    >
                      Submit Quiz <i className="bi bi-check-lg ms-1"></i>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── RESULT STEP ── */}
          {step === 'result' && (
            <>
              {/* score circle */}
              <div className={`quiz-score-card quiz-score-card--${scoreColor} mb-4`}>
                <div className={`quiz-score-circle quiz-score-circle--${scoreColor}`}>
                  <span className="quiz-score-circle__number">{scorePercent}%</span>
                </div>
                <h4 className="quiz-score-card__title">
                  {scorePercent >= 80 ? 'Excellent work!' : scorePercent >= 50 ? 'Good effort!' : 'Keep practising!'}
                </h4>
                <p className="quiz-score-card__subtitle">
                  You got <strong>{correctCount} out of {questions.length}</strong> correct
                </p>
              </div>

              {/* per-question breakdown */}
              <div className="quiz-card mb-4">
                <h6 className="quiz-review-title">Review</h6>
                {questions.map((q, i) => (
                  <div key={i} className={`quiz-review-item ${isCorrect(i) ? 'quiz-review-item--correct' : 'quiz-review-item--wrong'}`}>
                    <div className="quiz-review-item__icon">
                      <i className={`bi ${isCorrect(i) ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                    </div>
                    <div className="quiz-review-item__content">
                      <p className="quiz-review-item__question">{q.question}</p>
                      {/* show correct answer if they got it wrong */}
                      {!isCorrect(i) && (
                        <p className="quiz-review-item__correct-ans">
                          Correct: {q.options[q.answer]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* action buttons */}
              <div className="d-flex gap-3">
                <button className="btn sb-btn-ghost" onClick={handleRetake}>
                  <i className="bi bi-arrow-repeat me-2"></i>Retake Quiz
                </button>
                <button className="btn sb-btn-primary flex-grow-1 justify-content-center" onClick={() => navigate('/scores')}>
                  <i className="bi bi-graph-up me-2"></i>View Scores
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Quiz
