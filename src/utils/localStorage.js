// All localStorage functions are here in one place
// localStorage only stores strings, so we use JSON.stringify to save and JSON.parse to read

export const getProfile = () => {
  const data = localStorage.getItem('sb_profile')
  // if nothing saved yet, return null
  return data ? JSON.parse(data) : null
}

export const saveProfile = (profile) => {
  // convert the profile object to a string before saving
  localStorage.setItem('sb_profile', JSON.stringify(profile))
}

export const getNotes = () => {
  const data = localStorage.getItem('sb_notes')
  // if no notes yet, return empty array so .map() works without crashing
  return data ? JSON.parse(data) : []
}

export const saveNote = (note) => {
  const notes = getNotes()
  // unshift adds the new note to the BEGINNING so newest notes appear first
  notes.unshift(note)
  localStorage.setItem('sb_notes', JSON.stringify(notes))
}

export const deleteNote = (id) => {
  // filter keeps all notes EXCEPT the one with the matching id
  const notes = getNotes().filter((n) => n.id !== id)
  localStorage.setItem('sb_notes', JSON.stringify(notes))
}

export const getScores = () => {
  const data = localStorage.getItem('sb_scores')
  // if no scores yet, return empty array
  return data ? JSON.parse(data) : []
}

export const saveScore = (score) => {
  const scores = getScores()
  // unshift so latest score is always at index 0
  scores.unshift(score)
  localStorage.setItem('sb_scores', JSON.stringify(scores))
}
