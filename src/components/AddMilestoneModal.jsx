import { useState } from 'react'

export default function AddMilestoneModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('open')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Milestone Name is required.')
      return
    }

    onSubmit({
      name: name.trim(),
      status,
      dueDate,
    })
    onClose()
    setName('')
    setStatus('open')
    setDueDate('')
    setError('')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <div className="modal-header">
          <h3 className="modal-title">+ Add Milestone</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-banner mb-3">{error}</div>}

          <div className="form-group">
            <label className="form-label">Milestone Name *</label>
            <input
              type="text"
              className="neo-input"
              placeholder="e.g. Flight Safety Sign-off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
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

            <div className="form-group flex-1">
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              + Add Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
