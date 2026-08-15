import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Breadcrumb from '../../components/Breadcrumb'
import NavTabs from '../../components/NavTabs'
import StatusBadge from '../../components/StatusBadge'
import InactivityBadge from '../../components/InactivityBadge'
import MilestonesPanel from './MilestonesPanel'
import TasksPanel from './TasksPanel'
import IssuesPanel from './IssuesPanel'
import RawUpdatesPanel from './RawUpdatesPanel'
import AddUpdateForm from './AddUpdateForm'
import AIParsedUpdatesPanel from './AIParsedUpdatesPanel'
import EditProjectModal from '../../components/EditProjectModal'

const INACTIVE_THRESHOLD_DAYS = 21

function getDaysBetween(dateStr, relativeTo = new Date('2026-08-15')) {
  if (!dateStr) return 0
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 0
  const diffMs = relativeTo.getTime() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProjectDetailInternal() {
  const { id } = useParams()
  const { projects, milestones, tasks, issues, rawUpdates, editProject } = useData()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="page container" style={{ paddingTop: '40px' }}>
        <Breadcrumb items={[{ label: 'Projects', to: '/' }, { label: 'Not Found' }]} />
        <h2>Project not found</h2>
        <p className="text-muted" style={{ marginTop: '12px' }}>
          No project exists with ID &quot;{id}&quot;. <Link to="/" style={{ color: 'var(--accent)' }}>Back to overview</Link>
        </p>
      </div>
    )
  }

  const projectMilestones = milestones.filter((m) => m.projectId === id)
  const milestoneIds = new Set(projectMilestones.map((m) => m.id))
  const projectTasks = tasks.filter((t) => milestoneIds.has(t.milestoneId))
  const projectIssues = issues.filter((i) => i.projectId === id)
  const projectUpdates = rawUpdates.filter((u) => u.projectId === id)

  const lastActive = project.lastActivityAt || project.lastActive || project.createdAt
  const daysInactive = getDaysBetween(lastActive)
  const isInactive = daysInactive >= INACTIVE_THRESHOLD_DAYS
  const progressVal = project.progress !== undefined ? project.progress : 0

  const handleEditSubmit = (projectId, fields) => {
    editProject(projectId, fields)
  }

  return (
    <div className="page container">
      {/* Header */}
      <header className="page-header">
        <Breadcrumb
          items={[
            { label: 'Projects', to: '/' },
            { label: project.name },
          ]}
        />

        <div className="page-title-row">
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              {project.name}
            </h1>
            <p className="page-subtitle">{project.customer}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => setIsEditOpen(true)}
            >
              ✏ Edit Project
            </button>
            <NavTabs active="internal" projectId={id} />
          </div>
        </div>

        {/* Progress Bar Header Chip */}
        <div className="card mb-4" style={{ padding: '12px 16px' }}>
          <div className="flex justify-between items-center text-xs font-mono mb-2" style={{ fontWeight: 700 }}>
            <span>PROJECT OVERALL PROGRESS</span>
            <span>{progressVal}%</span>
          </div>
          <div className="progress-bar-track" style={{ height: '10px' }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progressVal}%`, height: '100%' }}
            />
          </div>
        </div>

        {/* Status + Meta bar */}
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: '16px' }}>
          <StatusBadge status={project.status} />
          {isInactive && <InactivityBadge days={daysInactive} />}

          {project.owners && project.owners.length > 0 && (
            <div className="flex items-center gap-2" style={{ marginLeft: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Owners
              </span>
              {project.owners.map((owner) => (
                <span key={owner} className="owner-chip">
                  {owner}
                </span>
              ))}
            </div>
          )}

          <span className="text-sm text-muted font-mono" style={{ marginLeft: 'auto' }}>
            Last Active: {formatDate(lastActive)}
          </span>
        </div>
      </header>

      {/* Content panels */}
      <div className="detail-page-content">
        <AddUpdateForm
          project={project}
          milestones={projectMilestones}
          tasks={projectTasks}
        />
        <AIParsedUpdatesPanel projectId={id} />
        <MilestonesPanel projectId={id} milestones={projectMilestones} />
        <TasksPanel milestones={projectMilestones} tasks={projectTasks} />
        <IssuesPanel projectId={id} issues={projectIssues} />
        <RawUpdatesPanel updates={projectUpdates} />
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditOpen}
        project={project}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
