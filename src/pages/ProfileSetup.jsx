import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProfile } from '../utils/localStorage'
import SUBJECTS from '../constants/subjects'
import './ProfileSetup.css'

const ProfileSetup = () => {
  // useNavigate lets us change the URL without a link click
  const navigate = useNavigate()

  // tracks what the student types in each input field
  const [form, setForm] = useState({ name: '', grade: '', subject: '' })

  // stores error messages shown below each empty field
  const [errors, setErrors] = useState({})

  // controls the button spinner while the profile is being saved
  const [saving, setSaving] = useState(false)

  // checks all fields are filled and returns an object with any error messages
  const validate = () => {
    const errs = {}
    // .trim() removes spaces so a field with only spaces is still considered empty
    if (!form.name.trim()) errs.name = 'Please enter your name'
    if (!form.grade.trim()) errs.grade = 'Please enter your class or semester'
    if (!form.subject) errs.subject = 'Please select a subject'
    return errs
  }

  // runs on every keystroke in any input or select
  const handleChange = (e) => {
    const { name, value } = e.target
    // spread (...prev) keeps all other fields unchanged, only updates the one that changed
    // [name] with square brackets means the key is dynamic — it becomes 'name', 'grade', or 'subject'
    setForm((prev) => ({ ...prev, [name]: value }))
    // clear the error for this field as soon as student starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // runs when the student clicks Get Started
  const handleSubmit = (e) => {
    // stops the browser from refreshing the page on form submit
    e.preventDefault()

    const errs = validate()
    // if there are any errors, show them and stop — do not save
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    // show spinner
    setSaving(true)

    // small delay so the spinner is visible
    setTimeout(() => {
      // save profile with form values plus a timestamp
      saveProfile({ ...form, createdAt: new Date().toISOString() })
      // go to dashboard
      navigate('/dashboard')
    }, 900)
  }

  // list of features shown on the left panel
  const features = [
    { icon: 'bi-lightning-charge-fill', text: 'AI-powered note analysis' },
    { icon: 'bi-bookmark-star-fill', text: 'Smart concept highlighting' },
    { icon: 'bi-patch-question-fill', text: 'Auto-generated quizzes' },
    { icon: 'bi-graph-up-arrow', text: 'Track your progress' },
  ]

  return (
    <div className="profile-page">

      {/* ── Left Panel ── */}
      <div className="profile-page__left">
        <div className="profile-page__logo">
          <i className="bi bi-book-half"></i>
        </div>
        <h1 className="profile-page__app-name">StudyBuddy</h1>
        <p className="profile-page__tagline">Your AI-powered learning companion</p>

        {/* loop through features array and render each one */}
        <div className="profile-page__features">
          {features.map((f, i) => (
            <div key={i} className="profile-page__feature">
              <div className="profile-page__feature-icon">
                <i className={`bi ${f.icon}`}></i>
              </div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* decorative background circles — purely visual, no content */}
        <div className="profile-page__decoration">
          <div className="deco-circle deco-circle--1"></div>
          <div className="deco-circle deco-circle--2"></div>
          <div className="deco-circle deco-circle--3"></div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="profile-page__right">
        <div className="profile-page__card">
          <div className="profile-page__card-header">
            <div className="profile-page__card-icon">
              <i className="bi bi-person-circle"></i>
            </div>
            <h2>Let&#39;s get started</h2>
            <p>Tell us a little about yourself to personalise your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Name field */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Your Name</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  name="name"
                  // is-invalid turns the border red when there is an error
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={handleChange}
                />
                {/* only shows if errors.name has a value */}
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
            </div>

            {/* Grade field */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Class / Semester</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-mortarboard"></i>
                </span>
                <input
                  type="text"
                  name="grade"
                  className={`form-control ${errors.grade ? 'is-invalid' : ''}`}
                  placeholder="e.g. Class 12 / Semester 3"
                  value={form.grade}
                  onChange={handleChange}
                />
                {errors.grade && (
                  <div className="invalid-feedback">{errors.grade}</div>
                )}
              </div>
            </div>

            {/* Subject dropdown */}
            <div className="mb-5">
              <label className="form-label fw-semibold">Favourite Subject</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-star"></i>
                </span>
                <select
                  name="subject"
                  className={`form-select ${errors.subject ? 'is-invalid' : ''}`}
                  value={form.subject}
                  onChange={handleChange}
                >
                  <option value="">Select your favourite subject</option>
                  {/* SUBJECTS array from constants/subjects.js */}
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <div className="invalid-feedback">{errors.subject}</div>
                )}
              </div>
            </div>

            {/* Submit button — disabled while saving to prevent double click */}
            <button
              type="submit"
              className="btn sb-btn-primary w-100 justify-content-center"
              disabled={saving}
            >
              {/* show spinner when saving, normal text otherwise */}
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Setting up your dashboard...
                </>
              ) : (
                <>
                  Get Started &nbsp;<i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileSetup
