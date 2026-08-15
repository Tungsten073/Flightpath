import MsPill from '../../components/MsPill'

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MilestonesPanel({ milestones }) {
  const doneCount = milestones.filter((m) => m.status === 'done').length

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title">
          <StarIcon />
          Milestones
        </span>
        <span className="panel-count">
          {doneCount}/{milestones.length} done
        </span>
      </div>

      <div className="panel-body">
        {milestones.map((m) => (
          <div key={m.id} className="milestone-item">
            <span className="item-name">{m.name}</span>
            <div className="flex items-center gap-3">
              <span className="item-meta">{formatDate(m.dueDate)}</span>
              <MsPill status={m.status} />
            </div>
          </div>
        ))}
      </div>
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
