import { useState } from 'react'

export default function AddIssueModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Implementation')
  const [status, setStatus] = useState('open')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('⚠️ Issue title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        category,
        status,
      })
      onClose()
      setTitle('')
      setCategory('Implementation')
      setStatus('open')
      setError('')
    } catch (err) {
      console.error('Add issue error:', err)
      setError(err.message || 'Failed to add issue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-banner">
          <h3 className="modal-title">✚ ADD ISSUE</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">Issue Title *</label>
              <input
                type="text"
                className="neo-input"
                placeholder="e.g. Telemetry packet loss under high load"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Category Taxonomy</label>
                <select
                  className="neo-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Bug">Bug</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Question">Question</option>
                  <option value="Support">Support</option>
                  <option value="Implementation">Implementation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="neo-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">OPEN</option>
                  <option value="closed">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : '+ Add Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
