import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import InactivityBadge from '../../components/InactivityBadge'

function formatDate(isoDate) {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProjectCard({ project, isInactive }) {
  const lastActive = project.lastActiveDate || project.lastActive || project.lastActivityAt
  const statusKey = project.normalizedStatus || project.status
  const progressVal = project.progress !== undefined ? project.progress : 0

  return (
    <Link to={`/project/${project.id}`} className="project-card">
      <div className="project-card-header">
        <h3 className="project-card-name">{project.name}</h3>
        <p className="project-card-customer">{project.customer}</p>
      </div>

      {/* Progress Bar & % */}
      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
        <div className="flex justify-between items-center text-xs font-mono" style={{ marginBottom: '4px', fontWeight: 700 }}>
          <span>PROGRESS</span>
          <span>{progressVal}%</span>
        </div>
        <div className="progress-bar-track" style={{ height: '8px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progressVal}%`, height: '100%' }}
          />
        </div>
      </div>

      <div className="project-card-badges">
        <StatusBadge status={statusKey} />
        {isInactive && <InactivityBadge days={project.daysInactive} />}
      </div>

      <div className="project-card-footer">
        {project.owners && project.owners.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-2">
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
        <div className="flex justify-between items-center text-xs font-mono" style={{ marginTop: '4px' }}>
          <span>Active: {formatDate(lastActive)}</span>
          <span>Created: {formatDate(project.createdAt || project.startDate)}</span>
        </div>
      </div>
    </Link>
  )
}
