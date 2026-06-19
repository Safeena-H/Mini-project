import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import Shimmer from '../components/Shimmer'
import { getNotes } from '../utils/localStorage'
import SUBJECTS from '../constants/subjects'
import './NotesList.css'

const NotesList = () => {
  // true by default so shimmers show on page load
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])

  // search text typed by student
  const [search, setSearch] = useState('')

  // selected subject from the filter dropdown, empty string means show all
  const [selectedSubject, setSelectedSubject] = useState('')

  // load notes after a short delay so shimmer is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotes(getNotes())
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // filter notes based on search text and selected subject
  const filteredNotes = notes.filter((note) => {
    // check if title or topic contains the search text (case insensitive)
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.topic.toLowerCase().includes(search.toLowerCase())

    // if a subject is selected, only show notes from that subject
    // if no subject selected (empty string), show all
    const matchesSubject = selectedSubject ? note.subject === selectedSubject : true

    return matchesSearch && matchesSubject
  })

  // get the list of subjects that the student actually has notes in
  const usedSubjects = [...new Set(notes.map((n) => n.subject))]

  // group filtered notes by subject — result is { 'Physics': [...notes], 'Maths': [...notes] }
  const groupedNotes = usedSubjects.reduce((acc, subject) => {
    const subjectNotes = filteredNotes.filter((n) => n.subject === subject)
    // only include subjects that have at least one note after filtering
    if (subjectNotes.length > 0) {
      acc[subject] = subjectNotes
    }
    return acc
  }, {})

  // clears both search and subject filter
  const clearFilters = () => {
    setSearch('')
    setSelectedSubject('')
  }

  return (
    <div className="notes-list-page">
      <div className="container py-4">

        {/* ── Page Header ── */}
        <div className="notes-list-header mb-4">
          <div>
            <h2 className="notes-list-title">My Notes</h2>
            {/* show note count and subject count after loading is done */}
            <p className="notes-list-subtitle">
              {loading
                ? 'Loading your notes...'
                : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} across ${usedSubjects.length} ${usedSubjects.length === 1 ? 'subject' : 'subjects'}`}
            </p>
          </div>
          <Link to="/add-note" className="btn sb-btn-primary">
            <i className="bi bi-plus-lg me-2"></i>Add Note
          </Link>
        </div>

        {/* ── Search and Filter ── */}
        {/* only show filters when notes exist */}
        {!loading && notes.length > 0 && (
          <div className="notes-list-filters mb-4">
            {/* search box */}
            <div className="notes-search">
              <i className="bi bi-search notes-search__icon"></i>
              <input
                type="text"
                className="form-control notes-search__input"
                placeholder="Search by title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* subject filter dropdown — only shows subjects that have notes */}
            <select
              className="form-select notes-filter-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {usedSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Notes Content ── */}

        {loading ? (
          // shimmer loading — 4 placeholder cards in 2 columns
          <div className="row g-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-6">
                <div className="notes-shimmer-card">
                  <div className="d-flex justify-content-between mb-2">
                    <Shimmer height="20px" width="100px" borderRadius="20px" />
                    <Shimmer height="14px" width="60px" borderRadius="4px" />
                  </div>
                  <Shimmer height="18px" width="70%" className="mb-2" borderRadius="5px" />
                  <Shimmer height="13px" width="40%" className="mb-2" borderRadius="4px" />
                  <Shimmer height="13px" width="95%" className="mb-1" borderRadius="4px" />
                  <Shimmer height="13px" width="80%" borderRadius="4px" />
                </div>
              </div>
            ))}
          </div>

        ) : notes.length === 0 ? (
          // empty state — student has no notes at all
          <div className="empty-state">
            <div className="empty-state__icon">
              <i className="bi bi-journal-plus"></i>
            </div>
            <h5>No notes yet</h5>
            <p>Start writing your first study note</p>
            <Link to="/add-note" className="btn sb-btn-primary">
              <i className="bi bi-plus-lg me-2"></i>Add Your First Note
            </Link>
          </div>

        ) : Object.keys(groupedNotes).length === 0 ? (
          // empty state — notes exist but none match the search or filter
          <div className="empty-state">
            <div className="empty-state__icon">
              <i className="bi bi-search"></i>
            </div>
            <h5>No notes found</h5>
            <p>Try a different search term or clear the filter</p>
            <button className="btn sb-btn-ghost" onClick={clearFilters}>
              Clear Search
            </button>
          </div>

        ) : (
          // notes grouped by subject
          // Object.entries converts { Physics: [...] } to [['Physics', [...]]]
          Object.entries(groupedNotes).map(([subject, subjectNotes]) => (
            <div key={subject} className="mb-5">

              {/* subject heading with note count badge */}
              <div className="subject-heading">
                <h5 className="subject-heading__name">{subject}</h5>
                <span className="subject-heading__count">
                  {subjectNotes.length} {subjectNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>

              {/* 2-column grid for note cards */}
              <div className="row g-3">
                {subjectNotes.map((note) => (
                  <div key={note.id} className="col-md-6">
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default NotesList
