import MsPill from '../../components/MsPill'

export default function TasksPanel({ milestones, tasks }) {
  const msWithTasks = milestones.map((ms) => ({
    ...ms,
    tasks: tasks.filter((t) => t.milestoneId === ms.id),
  })).filter((ms) => ms.tasks.length > 0)

  if (!msWithTasks.length) {
    return (
      <div className="panel-section">
        <div className="panel-header">
          <span className="panel-title"><CheckIcon />Tasks</span>
        </div>
        <div className="panel-empty">No tasks for this project.</div>
      </div>
    )
  }

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title"><CheckIcon />Tasks</span>
        <span className="panel-count">{tasks.length}</span>
      </div>
      <div className="panel-body">
        {msWithTasks.map((ms) => (
          <div key={ms.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Milestone label */}
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-faint)',
              paddingLeft: '4px',
            }}>
              {ms.name}
            </div>
            {/* Task rows */}
            <div className="task-group">
              {ms.tasks.map((task) => (
                <div key={task.id} className="task-row">
                  <span className="task-name">{task.name}</span>
                  <div className="task-meta">
                    <span className="owner-chip">{task.owner}</span>
                    <MsPill status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="panel-title-icon" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 10l2.5 2.5L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
