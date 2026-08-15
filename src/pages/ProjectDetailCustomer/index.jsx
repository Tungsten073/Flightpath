import { useParams, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import Breadcrumb from '../../components/Breadcrumb'
import NavTabs from '../../components/NavTabs'
import StatusBadge from '../../components/StatusBadge'
import MilestoneTaskTree from './MilestoneTaskTree'
import CustomerIssues from './CustomerIssues'
import CustomerAIUpdates from './CustomerAIUpdates'

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProjectDetailCustomer() {
  const { id } = useParams()
  const { projects, milestones, tasks, issues } = useData()

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

  // Filter out internal-only issues (Bug) for customer view
  const INTERNAL_CATEGORIES = new Set(['Bug'])
  const projectIssues = issues.filter(
    (i) => i.projectId === id && !INTERNAL_CATEGORIES.has(i.category) && i.status !== 'closed'
  )

  const lastActive = project.lastActivityAt || project.lastActive || project.createdAt
  const progressVal = project.progress !== undefined ? project.progress : 0

  return (
    <div className="page container">
      {/* Header */}
      <header className="page-header">
        <Breadcrumb
          items={[
            { label: 'Projects', to: '/' },
            { label: project.name, to: `/project/${id}` },
            { label: 'Customer View' },
          ]}
        />

        <div className="page-title-row">
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              {project.name}
            </h1>
            <p className="page-subtitle">{project.customer}</p>
          </div>

          <NavTabs active="customer" projectId={id} />
        </div>

        {/* Customer Progress Bar */}
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

        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: '16px' }}>
          <StatusBadge status={project.status} />
          <span className="text-sm text-muted font-mono" style={{ marginLeft: 'auto' }}>
            Last Active: {formatDate(lastActive)}
          </span>
        </div>
      </header>

      {/* Customer welcome banner */}
      <div className="customer-banner" style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ flexShrink: 0 }}>
          <InfoIcon />
        </div>
        <div>
          <div className="customer-banner-title">
            Project Update for {project.customer}
          </div>
          <div className="customer-banner-text">
            Last updated {formatDate(lastActive)}. This view shows your project milestones, tasks, and open items.
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-page-content">
        <CustomerAIUpdates projectId={id} />
        <MilestoneTaskTree
          milestones={projectMilestones}
          tasks={projectTasks}
        />
        <CustomerIssues issues={projectIssues} />
      </div>

      <footer style={{ marginTop: '48px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Powered by Flightpath · Delivery Operations
      </footer>
    </div>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--accent)' }}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}
