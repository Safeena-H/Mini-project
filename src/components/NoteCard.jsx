import './NoteCard.css'

// maps each subject to a colour for the left border of the card
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

// NoteCard shows a single note — used in Dashboard and NotesList
const NoteCard = ({ note }) => {
  // look up the colour for this note's subject, default to purple if not found
  const color = SUBJECT_COLORS[note.subject] || 'purple'

  // convert ISO date string to readable format like "16 Jun"
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })

  // show only first 110 characters of content to keep cards the same height
  const preview =
    note.content.length > 110
      ? note.content.substring(0, 110) + '...'
      : note.content

  return (
    // note-card--blue, note-card--green etc. change the left border colour
    <div className={`note-card note-card--${color}`}>

      {/* top row: subject badge on left, date on right */}
      <div className="note-card__header">
        <span className="note-card__subject">{note.subject}</span>
        <span className="note-card__date">{formattedDate}</span>
      </div>

      <h5 className="note-card__title">{note.title}</h5>
      <p className="note-card__topic">
        <i className="bi bi-bookmark-fill me-1"></i>
        {note.topic}
      </p>
      <p className="note-card__preview">{preview}</p>

      {/* AI badge only shows after the note has been analysed — summary is null by default */}
      {note.summary && (
        <div className="note-card__ai-badge">
          <i className="bi bi-stars me-1"></i> AI Analyzed
        </div>
      )}
    </div>
  )
}

export default NoteCard
