import { useState } from 'react'
import { useData } from '../../context/DataContext'
import AddTaskModal from '../../components/AddTaskModal'

export default function TasksPanel({ milestones, tasks }) {
  const { addTask, updateTaskStatus, deleteTask } = useData()
  const [isAddOpen, setIsAddOpen] = useState(false)

  const msWithTasks = milestones.map((ms) => ({
    ...ms,
    tasks: tasks.filter((t) => t.milestoneId === ms.id),
  }))

  const knownMsIds = new Set(milestones.map((m) => m.id))
  const orphanedTasks = tasks.filter((t) => !knownMsIds.has(t.milestoneId))

  const handleStatusToggle = async (taskId, currentStatus) => {
    const nextStatusMap = { open: 'done', done: 'blocked', blocked: 'open' }
    const nextStatus = nextStatusMap[currentStatus] || 'open'
    await updateTaskStatus(taskId, nextStatus)
  }

  const handleAddTask = async (milestoneId, taskFields) => {
    await addTask(milestoneId, taskFields)
  }

  return (
    <div className="panel-section">
      <div className="panel-header flex justify-between items-center">
        <span className="panel-title"><CheckIcon />Tasks</span>
        <div className="flex items-center gap-3">
          <span className="panel-count">{tasks.length}</span>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            onClick={() => setIsAddOpen(true)}
            disabled={milestones.length === 0}
            title={milestones.length === 0 ? 'Create a milestone first to add tasks' : 'Add task'}
          >
            + Add Task
          </button>
        </div>
      </div>

      <div className="panel-body">
        {tasks.length > 0 ? (
          <>
            {msWithTasks.map((ms) => (
              ms.tasks.length > 0 && (
                <div key={ms.id} className="mb-4 flex flex-col gap-2">
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--accent-green, #005C2B)',
                    paddingLeft: '4px',
                  }}>
                    Milestone: {ms.name}
                  </div>
                  <div className="task-group">
                    {ms.tasks.map((task) => (
                      <div key={task.id} className="task-row flex justify-between items-center py-2 border-b border-subtle">
                        <span className="task-name font-mono">{task.name}</span>
                        <div className="task-meta flex items-center gap-2">
                          {task.owner && <span className="owner-chip">{task.owner}</span>}
                          <button
                            type="button"
                            className={`ms-pill ms-pill-${task.status} ${task.status} cursor-pointer`}
                            onClick={() => handleStatusToggle(task.id, task.status)}
                            title="Click to toggle status (OPEN -> DONE -> BLOCKED)"
                          >
                            {task.status.toUpperCase()}
                          </button>
                          <button
                            type="button"
                            className="text-xs text-muted hover:text-danger ml-1"
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {orphanedTasks.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-faint)',
                  paddingLeft: '4px',
                }}>
                  Direct AI Tasks
                </div>
                <div className="task-group">
                  {orphanedTasks.map((task) => (
                    <div key={task.id} className="task-row flex justify-between items-center py-2 border-b border-subtle">
                      <span className="task-name font-mono">{task.name}</span>
                      <div className="task-meta flex items-center gap-2">
                        {task.owner && <span className="owner-chip">{task.owner}</span>}
                        <button
                          type="button"
                          className={`ms-pill ms-pill-${task.status} ${task.status} cursor-pointer`}
                          onClick={() => handleStatusToggle(task.id, task.status)}
                          title="Click to toggle status (OPEN -> DONE -> BLOCKED)"
                        >
                          {task.status.toUpperCase()}
                        </button>
                        <button
                          type="button"
                          className="text-xs text-muted hover:text-danger ml-1"
                          onClick={() => deleteTask(task.id)}
                          title="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="panel-empty p-4 text-center">
            <p className="text-muted text-sm mb-2 font-mono">No tasks yet.</p>
            {milestones.length > 0 && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem' }}
                onClick={() => setIsAddOpen(true)}
              >
                + Add Task
              </button>
            )}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddOpen}
        milestones={milestones}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddTask}
      />
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
