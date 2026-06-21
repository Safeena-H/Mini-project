import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Shimmer from '../components/Shimmer'
import { getNotes, updateNote, deleteNote } from '../utils/localStorage'
import { analyzeNote } from '../utils/gemini'
import './NoteDetail.css'

// color map — same as NoteCard so the accent color stays consistent
const SUBJECT_COLORS = {
  Mathematics: 'purple',
  Physics: 'blue',
  Chemistry: 'green',
  Biology: 'teal',
  'Computer Science': 'orange',
  English: 'pink',
  History: 'red',
  Geography: 'cyan',
  Economics: 'indigo',
}

const NoteDetail = () => {
  // useParams reads the :id segment from the URL  e.g. /notes/1718123456789
  const { id } = useParams()
  const navigate = useNavigate()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  // editing mode — swaps view text for editable inputs
  const [editing, setEditing] = useState(false)

  // holds title and content values while the student is editing
  const [editForm, setEditForm] = useState({ title: '', content: '' })

  // shows spinner on save button during the brief save delay
  const [saving, setSaving] = useState(false)

  // controls the visibility of the delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // true while the Gemini API call is in progress — shows spinner on analyze button
  const [analyzing, setAnalyzing] = useState(false)

  // stores the error message if the Gemini API call fails
  const [analyzeError, setAnalyzeError] = useState('')

  // load the note on page open — short delay so shimmer is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      const notes = getNotes()
      // find the note whose id matches the URL param
      const found = notes.find((n) => n.id === id)

      if (!found) {
        // note does not exist — go back to notes list
        navigate('/notes', { replace: true })
        return
      }

      setNote(found)
      // pre-fill edit form with current values so student sees existing text when they click Edit
      setEditForm({ title: found.title, content: found.content })
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [id, navigate])

  // called when student clicks Save inside edit mode
  const handleSave = () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return

    setSaving(true)
    setTimeout(() => {
      // merge only title and content — keep subject, topic, AI fields unchanged
      updateNote(id, { title: editForm.title.trim(), content: editForm.content.trim() })

      // update local state so the page re-renders with new values immediately
      setNote((prev) => ({ ...prev, title: editForm.title.trim(), content: editForm.content.trim() }))

      setEditing(false)
      setSaving(false)
    }, 600)
  }

  // called when student confirms delete in the confirmation box
  const handleDelete = () => {
    deleteNote(id)
    // go back to notes list after deleting
    navigate('/notes', { replace: true })
  }

  // sends the note to Gemini and saves the results back to localStorage
  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError('')

    try {
      // call Gemini — returns { summary: '...', keyConcepts: [...] }
      const result = await analyzeNote(note.title, note.content)

      // save summary and keyConcepts to localStorage so they persist on refresh
      updateNote(id, { summary: result.summary, keyConcepts: result.keyConcepts })

      // update local state so the page shows the results immediately without a reload
      setNote((prev) => ({ ...prev, summary: result.summary, keyConcepts: result.keyConcepts }))
    } catch (err) {
      // show the error message under the button so the student knows what went wrong
      setAnalyzeError(err.message || 'Something went wrong. Please try again.')
    } finally {
      // always turn off the spinner, whether success or failure
      setAnalyzing(false)
    }
  }

  // format ISO date to readable string like "16 June 2024"
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  // word count of the note content
  const wordCount = note?.content.trim().split(/\s+/).length || 0

  const color = SUBJECT_COLORS[note?.subject] || 'purple'

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="note-detail-page">
        <div className="container py-4">
          <div className="col-lg-8 mx-auto">
            <Shimmer height="20px" width="80px" borderRadius="6px" className="mb-4" />
            <div className="note-detail-card">
              <Shimmer height="22px" width="100px" borderRadius="20px" className="mb-3" />
              <Shimmer height="30px" width="80%" borderRadius="6px" className="mb-2" />
              <Shimmer height="16px" width="40%" borderRadius="4px" className="mb-4" />
              <Shimmer height="13px" width="100%" borderRadius="4px" className="mb-2" />
              <Shimmer height="13px" width="95%" borderRadius="4px" className="mb-2" />
              <Shimmer height="13px" width="88%" borderRadius="4px" className="mb-2" />
              <Shimmer height="13px" width="70%" borderRadius="4px" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main View ──────────────────────────────────────────────────────────────

  return (
    <div className="note-detail-page">
      <div className="container py-4">
        <div className="col-lg-8 mx-auto">

          {/* ── Top Bar: back + action buttons ── */}
          <div className="note-detail-topbar mb-4">
            {/* navigate(-1) goes back one step in browser history */}
            <button className="note-detail-back-btn" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-1"></i> Back
            </button>

            {/* action buttons — hidden during delete confirmation */}
            {!showDeleteConfirm && (
              <div className="d-flex gap-2">
                {editing ? (
                  // in edit mode: show Save and Cancel
                  <>
                    <button className="btn note-detail-cancel-btn" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button
                      className="btn sb-btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Saving...
                        </>
                      ) : (
                        <><i className="bi bi-check-lg me-1"></i> Save</>
                      )}
                    </button>
                  </>
                ) : (
                  // view mode: show Edit and Delete
                  <>
                    <button
                      className="btn note-detail-edit-btn"
                      onClick={() => setEditing(true)}
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      className="btn note-detail-delete-btn"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <i className="bi bi-trash me-1"></i> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Delete Confirmation Banner ── */}
          {showDeleteConfirm && (
            <div className="delete-confirm-banner mb-4">
              <div className="delete-confirm-banner__text">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Are you sure you want to delete this note? This cannot be undone.
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn note-detail-cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button className="btn note-detail-delete-btn" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> Yes, Delete
                </button>
              </div>
            </div>
          )}

          {/* ── Note Header Card ── */}
          {/* note-detail-card--blue/green etc. changes the top border color */}
          <div className={`note-detail-card note-detail-card--${color} mb-4`}>

            {/* subject badge + date row */}
            <div className="note-detail-card__meta mb-3">
              <span className="note-detail-subject">{note.subject}</span>
              <span className="note-detail-date">
                <i className="bi bi-calendar3 me-1"></i>
                {formatDate(note.createdAt)}
              </span>
            </div>

            {/* title — input when editing, heading when viewing */}
            {editing ? (
              <input
                type="text"
                className="form-control note-detail-title-input mb-2"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Note title"
              />
            ) : (
              <h2 className="note-detail-title">{note.title}</h2>
            )}

            {/* topic — not editable (topic is part of the note structure) */}
            <div className="note-detail-topic">
              <i className="bi bi-bookmark-fill me-1"></i>
              {note.topic}
            </div>

            {/* word count badge */}
            <div className="note-detail-wordcount mt-2">
              <i className="bi bi-file-text me-1"></i>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </div>
          </div>

          {/* ── Note Content Card ── */}
          <div className="note-detail-content-card mb-4">
            <h6 className="note-detail-section-title">
              <i className="bi bi-journal-text me-2 text-purple"></i>Note Content
            </h6>

            {/* textarea when editing, paragraph when viewing */}
            {editing ? (
              <textarea
                className="form-control note-detail-content-textarea"
                value={editForm.content}
                onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Write your note content here..."
              />
            ) : (
              // pre-wrap preserves newlines the student typed
              <p className="note-detail-content">{note.content}</p>
            )}
          </div>

          {/* ── AI Analysis Section ── */}
          {/* only shown in view mode, not while editing */}
          {!editing && (
            <div className="ai-section">
              <h6 className="note-detail-section-title">
                <i className="bi bi-stars me-2 text-purple"></i>AI Analysis
              </h6>

              {note.summary ? (
                // note has already been analyzed — show the results
                <div className="ai-results">
                  <div className="ai-results__summary">
                    <p className="ai-results__summary-label">Summary</p>
                    <p className="ai-results__summary-text">{note.summary}</p>
                  </div>

                  {note.keyConcepts.length > 0 && (
                    <div className="ai-results__concepts">
                      <p className="ai-results__concepts-label">Key Concepts</p>
                      <div className="ai-results__chips">
                        {note.keyConcepts.map((concept, i) => (
                          <span key={i} className="concept-chip">{concept}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // not analyzed yet — show the prompt to analyze
                <div className="ai-placeholder">
                  <div className="ai-placeholder__icon">
                    <i className="bi bi-stars"></i>
                  </div>
                  <p className="ai-placeholder__text">
                    Get an AI-generated summary and key concepts for this note
                  </p>
                  {/* clicking this calls the Gemini API and fills in the summary and key concepts */}
                  <button
                    className="btn sb-btn-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Analyzing...
                      </>
                    ) : (
                      <><i className="bi bi-stars me-2"></i>Analyze with AI</>
                    )}
                  </button>

                  {/* shows if the API call fails — e.g. wrong key, network error */}
                  {analyzeError && (
                    <p className="ai-error-text mt-3">{analyzeError}</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default NoteDetail
