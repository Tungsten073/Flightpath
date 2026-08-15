import { useState } from 'react'

export default function AddMilestoneModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('open')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('⚠️ Milestone Name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        status,
        dueDate: dueDate || null,
      })
      onClose()
      setName('')
      setStatus('open')
      setDueDate('')
      setError('')
    } catch (err) {
      console.error('Add milestone error:', err)
      setError(err.message || 'Failed to add milestone.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-banner">
          <h3 className="modal-title">✚ ADD MILESTONE</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">Milestone Name *</label>
              <input
                type="text"
                className="neo-input"
                placeholder="e.g. Flight Safety Sign-off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="neo-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">OPEN</option>
                  <option value="blocked">BLOCKED</option>
                  <option value="done">DONE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="neo-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : '+ Add Milestone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
