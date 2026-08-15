import MsPill from '../../components/MsPill'

/**
 * MilestoneTaskTree (customer view)
 * - Shows milestone names + status
 * - Shows task names + status under each milestone
 * - Omits owner names on tasks
 */
export default function MilestoneTaskTree({ milestones, tasks }) {
  const msWithTasks = milestones.map((ms) => ({
    ...ms,
    tasks: tasks.filter((t) => t.milestoneId === ms.id),
  }))

  if (!msWithTasks.length) {
    return (
      <div className="panel-section">
        <div className="panel-header">
          <span className="panel-title"><MsIcon />Milestones &amp; Tasks</span>
        </div>
        <div className="panel-empty">No milestones yet.</div>
      </div>
    )
  }

  const total = milestones.length
  const done  = milestones.filter((m) => m.status === 'done').length

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title"><MsIcon />Milestones &amp; Tasks</span>
        <span className="panel-count">{done}/{total} done</span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="progress-bar-wrap">
          <div className="progress-bar-label">
            <span>Progress</span>
            <span>{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone + task tree */}
      <div className="panel-body">
        <div className="ms-tree">
          {msWithTasks.map((ms) => (
            <div key={ms.id} className="ms-tree-milestone">
              {/* Milestone header */}
              <div className="ms-tree-milestone-header">
                <span className="ms-tree-milestone-name">{ms.name}</span>
                <div className="ms-tree-milestone-meta">
                  <span className="milestone-due text-xs">
                    {new Date(ms.dueDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <MsPill status={ms.status} />
                </div>
              </div>

              {/* Tasks — no owner column */}
              {ms.tasks.length > 0 && (
                <div className="ms-tree-tasks">
                  {ms.tasks.map((task) => (
                    <div key={task.id} className="ms-tree-task-row">
                      <span className="ms-tree-task-name">{task.name}</span>
                      <MsPill status={task.status} />
                    </div>
                  ))}
                </div>
              )}

              {ms.tasks.length === 0 && (
                <div style={{ padding: 'var(--space-2) var(--space-6)', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                  No sub-tasks
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MsIcon() {
  return (
    <svg className="panel-title-icon" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l1.5 4.5H16l-3.6 2.6 1.4 4.4L10 11l-3.8 2.5 1.4-4.4L4 6.5h4.5L10 2z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
