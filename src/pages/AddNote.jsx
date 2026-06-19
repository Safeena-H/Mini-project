import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveNote } from '../utils/localStorage'
import SUBJECTS from '../constants/subjects'
import './AddNote.css'

const AddNote = () => {
  const navigate = useNavigate()

  // tracks the values of all four form fields
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    title: '',
    content: '',
  })

  // stores validation error messages for each field
  const [errors, setErrors] = useState({})

  // true while the 800ms save delay is happening — shows spinner on button
  const [saving, setSaving] = useState(false)

  // true after note is saved — shows green success alert
  // separate from 'saving' because they represent two different moments
  const [saved, setSaved] = useState(false)

  // checks all fields and returns an object of error messages
  const validate = () => {
    const errs = {}
    if (!form.subject) errs.subject = 'Please select a subject'
    if (!form.topic.trim()) errs.topic = 'Please enter a topic name'
    if (!form.title.trim()) errs.title = 'Please give your note a title'
    if (!form.content.trim()) errs.content = 'Note content cannot be empty'
    // extra check — content must be at least 20 characters
    else if (form.content.trim().length < 20)
      errs.content = 'Please write at least 20 characters'
    return errs
  }

  // runs on every keystroke — updates form state and clears error for that field
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // runs when student clicks Save Note
  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()

    // if any errors, show them and stop
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSaving(true)

    // build the note object to save
    const note = {
      // Date.now() gives milliseconds since 1970 — always unique, perfect for an ID
      id: Date.now().toString(),
      subject: form.subject,
      topic: form.topic,
      title: form.title,
      content: form.content,
      createdAt: new Date().toISOString(),
      // summary and keyConcepts are null/empty now — filled in by AI Analysis feature later
      summary: null,
      keyConcepts: [],
    }

    setTimeout(() => {
      saveNote(note)
      setSaving(false)
      // show green success alert
      setSaved(true)
      // wait 1.4 more seconds then go to dashboard
      setTimeout(() => navigate('/dashboard'), 1400)
    }, 800)
  }

  // counts words in the content field — updates live as student types
  // /\s+/ is a regex that splits by any whitespace (spaces, newlines, tabs)
  const wordCount = form.content.trim()
    ? form.content.trim().split(/\s+/).length
    : 0

  return (
    <div className="add-note-page">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* ── Page Header ── */}
            <div className="add-note-header mb-4">
              {/* navigate(-1) goes back to the previous page in browser history */}
              <button className="add-note-back-btn" onClick={() => navigate(-1)} type="button">
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
              <div>
                <h2 className="add-note-title">Add New Note</h2>
                <p className="add-note-subtitle">
                  Write your study notes and let AI help you revise faster
                </p>
              </div>
            </div>

            {/* ── Success Alert — only visible after note is saved ── */}
            {saved && (
              <div className="add-note-success-alert mb-4">
                <i className="bi bi-check-circle-fill me-2"></i>
                Note saved! Redirecting to dashboard...
              </div>
            )}

            {/* ── Form Card ── */}
            <div className="add-note-card">
              <form onSubmit={handleSubmit}>

                {/* Subject and Topic side by side on medium+ screens */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-collection me-1 text-purple"></i> Subject
                    </label>
                    <select
                      name="subject"
                      className={`form-select ${errors.subject ? 'is-invalid' : ''}`}
                      value={form.subject}
                      onChange={handleChange}
                    >
                      <option value="">Choose subject...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && (
                      <div className="invalid-feedback">{errors.subject}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-bookmark me-1 text-blue"></i> Topic
                    </label>
                    <input
                      type="text"
                      name="topic"
                      className={`form-control ${errors.topic ? 'is-invalid' : ''}`}
                      placeholder="e.g. Newton&#39;s Laws of Motion"
                      value={form.topic}
                      onChange={handleChange}
                    />
                    {errors.topic && (
                      <div className="invalid-feedback">{errors.topic}</div>
                    )}
                  </div>
                </div>

                {/* Note Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-card-heading me-1 text-green"></i> Note Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    placeholder="Give your note a clear title"
                    value={form.title}
                    onChange={handleChange}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>

                {/* Note Content with live word count */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-semibold mb-0">
                      <i className="bi bi-journal-text me-1 text-orange"></i> Note Content
                    </label>
                    {/* word count updates on every keystroke */}
                    <span className="add-note-wordcount">
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                  </div>
                  <textarea
                    name="content"
                    className={`form-control add-note-textarea ${errors.content ? 'is-invalid' : ''}`}
                    placeholder="Write your study notes here. The more detailed you write, the better the AI analysis will be..."
                    value={form.content}
                    onChange={handleChange}
                    rows={10}
                  />
                  {errors.content && (
                    <div className="invalid-feedback">{errors.content}</div>
                  )}
                </div>

                {/* AI hint banner — informs student about upcoming AI feature */}
                <div className="add-note-ai-hint mb-4">
                  <i className="bi bi-stars me-2"></i>
                  <span>
                    After saving, click <strong>Analyze with AI</strong> on the note to get
                    a summary and key concepts automatically!
                  </span>
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-3">
                  <button type="button" className="sb-btn-ghost" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                  {/* disabled when saving OR after saved — prevents double submit */}
                  <button
                    type="submit"
                    className="btn sb-btn-primary flex-grow-1 justify-content-center"
                    disabled={saving || saved}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>Save Note
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AddNote
