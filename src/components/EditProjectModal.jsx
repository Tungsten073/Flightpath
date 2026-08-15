import { useState, useEffect } from 'react'

export default function EditProjectModal({ isOpen, project, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [customer, setCustomer] = useState('')
  const [owners, setOwners] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('On Track')
  const [progress, setProgress] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name || '')
      setCustomer(project.customer || '')
      setOwners(Array.isArray(project.owners) ? project.owners.join(', ') : project.owners || '')
      setDescription(project.description || '')
      setStatus(project.status || 'On Track')
      setProgress(project.progress !== undefined ? project.progress : 0)
      setStartDate(project.startDate || '')
      setDueDate(project.dueDate || '')
    }
  }, [project])

  if (!isOpen || !project) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Project Name is required.')
      return
    }
    if (!customer.trim()) {
      setError('Customer Name is required.')
      return
    }

    const progNum = Number(progress)
    if (isNaN(progNum) || progNum < 0 || progNum > 100) {
      setError('Progress must be between 0 and 100.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(project.id, {
        name: name.trim(),
        customer: customer.trim(),
        owners: owners.split(',').map((o) => o.trim()).filter(Boolean),
        description: description.trim(),
        status,
        progress: progNum,
        startDate,
        dueDate,
      })
      onClose()
    } catch (err) {
      console.error('Edit project error:', err)
      setError(err.message || 'Failed to update project.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">✏ Edit Project</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-banner mb-3">{error}</div>}

          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              className="neo-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                className="neo-input"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Project Owner(s)</label>
              <input
                type="text"
                className="neo-input"
                value={owners}
                onChange={(e) => setOwners(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="neo-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Blocked">Blocked</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Progress % (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="neo-input"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="neo-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
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
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
