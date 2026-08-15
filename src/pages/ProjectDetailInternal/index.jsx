import { useParams, Link } from 'react-router-dom'
import mockData from '@data'
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

const { projects, milestones, tasks, issues, rawUpdates } = mockData

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

  const lastActive = project.lastActivityAt || project.lastActive
  const daysInactive = getDaysBetween(lastActive)
  const isInactive = daysInactive >= INACTIVE_THRESHOLD_DAYS

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

          <NavTabs active="internal" projectId={id} />
        </div>

        {/* Status + Meta bar */}
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: '16px' }}>
          <StatusBadge status={project.status} />
          {isInactive && <InactivityBadge days={daysInactive} />}

          {project.owners && project.owners.length > 0 && (
            <div className="flex items-center gap-2" style={{ marginLeft: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Owners
              </span>
              {project.owners.map((owner) => (
                <span key={owner} className="owner-chip">
                  {owner}
                </span>
              ))}
            </div>
          )}

          <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
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
        <MilestonesPanel milestones={projectMilestones} />
        <TasksPanel milestones={projectMilestones} tasks={projectTasks} />
        <IssuesPanel issues={projectIssues} />
        <RawUpdatesPanel updates={projectUpdates} />
      </div>
    </div>
  )
}
