import { useState } from 'react'
import { useData } from '../../context/DataContext'
import AddMilestoneModal from '../../components/AddMilestoneModal'

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MilestonesPanel({ projectId, milestones }) {
  const { addMilestone, updateMilestoneStatus, deleteMilestone } = useData()
  const [isAddOpen, setIsAddOpen] = useState(false)

  const doneCount = milestones.filter((m) => m.status === 'done').length

  const handleStatusToggle = (milestoneId, currentStatus) => {
    const nextStatusMap = { open: 'done', done: 'blocked', blocked: 'open' }
    const nextStatus = nextStatusMap[currentStatus] || 'open'
    updateMilestoneStatus(milestoneId, nextStatus)
  }

  const handleAddSubmit = (msFields) => {
    addMilestone(projectId, msFields)
  }

  return (
    <div className="panel-section">
      <div className="panel-header flex justify-between items-center">
        <span className="panel-title">
          <StarIcon />
          Milestones
        </span>
        <div className="flex items-center gap-3">
          <span className="panel-count">
            {doneCount}/{milestones.length} done
          </span>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            onClick={() => setIsAddOpen(true)}
          >
            + Add Milestone
          </button>
        </div>
      </div>

      <div className="panel-body">
        {milestones.length > 0 ? (
          milestones.map((m) => (
            <div key={m.id} className="milestone-item flex justify-between items-center py-2 border-b border-subtle">
              <span className="item-name font-bold">{m.name}</span>
              <div className="flex items-center gap-3">
                <span className="item-meta text-xs text-muted">{formatDate(m.dueDate)}</span>

                {/* Status Toggle Button */}
                <button
                  type="button"
                  className={`ms-pill ms-pill-${m.status} ${m.status} cursor-pointer`}
                  onClick={() => handleStatusToggle(m.id, m.status)}
                  title="Click to toggle status (OPEN -> DONE -> BLOCKED)"
                >
                  {m.status.toUpperCase()}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  className="text-xs text-muted hover:text-danger ml-1"
                  onClick={() => deleteMilestone(m.id)}
                  title="Delete milestone"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="panel-empty p-4 text-center">
            <p className="text-muted text-sm mb-2 font-mono">No milestones yet — Add your first milestone.</p>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setIsAddOpen(true)}
            >
              + Add Milestone
            </button>
          </div>
        )}
      </div>

      <AddMilestoneModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}>
      <path d="M8 1.5l1.9 3.9 4.3.6-3.1 3 0.7 4.3L8 11.3l-3.8 2 0.7-4.3-3.1-3 4.3-.6L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}
