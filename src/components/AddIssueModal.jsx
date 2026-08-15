import { useState } from 'react'

export default function AddIssueModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Implementation')
  const [status, setStatus] = useState('open')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Issue title is required.')
      return
    }

    onSubmit({
      title: title.trim(),
      category,
      status,
    })
    onClose()
    setTitle('')
    setCategory('Implementation')
    setStatus('open')
    setError('')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <div className="modal-header">
          <h3 className="modal-title">+ Add Issue</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-banner mb-3">{error}</div>}

          <div className="form-group">
            <label className="form-label">Issue Title *</label>
            <input
              type="text"
              className="neo-input"
              placeholder="e.g. Telemetry packet loss under high load"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
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

            <div className="form-group flex-1">
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              + Add Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
