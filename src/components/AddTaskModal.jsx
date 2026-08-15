import { useState } from 'react'

export default function AddTaskModal({ isOpen, milestones, onClose, onSubmit }) {
  const [milestoneId, setMilestoneId] = useState(milestones[0]?.id || '')
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [status, setStatus] = useState('open')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('⚠️ Task Name is required.')
      return
    }
    const targetMsId = milestoneId || milestones[0]?.id
    if (!targetMsId) {
      setError('⚠️ Please create a milestone first.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(targetMsId, {
        name: name.trim(),
        owner: owner.trim(),
        status,
      })
      onClose()
      setName('')
      setOwner('')
      setStatus('open')
      setError('')
    } catch (err) {
      console.error('Add task error:', err)
      setError(err.message || 'Failed to add task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-banner">
          <h3 className="modal-title">✚ ADD TASK</h3>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">Target Milestone *</label>
              <select
                className="neo-select"
                value={milestoneId || (milestones[0]?.id || '')}
                onChange={(e) => setMilestoneId(e.target.value)}
              >
                {milestones.map((ms) => (
                  <option key={ms.id} value={ms.id}>
                    {ms.name} ({ms.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Task Name *</label>
              <input
                type="text"
                className="neo-input"
                placeholder="e.g. Calibrate GPS telemetry sensors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-grid-2">
              <div className="form-group">
                <label className="form-label">Owner</label>
                <input
                  type="text"
                  className="neo-input"
                  placeholder="e.g. Priya Nair"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>

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
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-modal-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : '+ Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
