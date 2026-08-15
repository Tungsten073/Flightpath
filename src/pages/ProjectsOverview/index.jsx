import mockData from '@data'
import ProjectCard from './ProjectCard'
import WordReveal from '../../components/WordReveal'
import MarqueeStrip from '../../components/MarqueeStrip'

const INACTIVE_THRESHOLD_DAYS = 21

function normalizeStatus(status) {
  if (!status) return ''
  return status.toLowerCase().replace(/\s+/g, '_')
}

function parseFlexibleDate(dateStr) {
  if (!dateStr) return null
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date

  const months = { Jul: 'July', Jun: 'June', May: 'May', Apr: 'April', Mar: 'March', Jan: 'January', Feb: 'February', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' }
  let fixed = String(dateStr)
  for (const [short, long] of Object.entries(months)) {
    fixed = fixed.replace(short, long)
  }
  date = new Date(fixed)
  return isNaN(date.getTime()) ? null : date
}

function getDaysBetween(dateStr, relativeTo = new Date('2026-08-15')) {
  const date = parseFlexibleDate(dateStr)
  if (!date) return 0
  const diffMs = relativeTo.getTime() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export default function ProjectsOverview() {
  const { projects } = mockData

  const processedProjects = projects.map((p) => {
    const lastActive = p.lastActivityAt || p.lastActive
    const daysInactive = getDaysBetween(lastActive)
    const normalized = normalizeStatus(p.status)
    return {
      ...p,
      normalizedStatus: normalized,
      lastActiveDate: lastActive,
      daysInactive,
      isInactive: daysInactive >= INACTIVE_THRESHOLD_DAYS,
    }
  })

  const total = processedProjects.length
  const onTrack = processedProjects.filter((p) => p.normalizedStatus === 'on_track').length
  const atRisk = processedProjects.filter((p) => p.normalizedStatus === 'at_risk').length
  const blocked = processedProjects.filter((p) => p.normalizedStatus === 'blocked').length
  const completed = processedProjects.filter((p) => p.normalizedStatus === 'completed').length
  const inactiveCount = processedProjects.filter((p) => p.isInactive).length

  const marqueeItems = [
    `${total} Active Engagements`,
    `${onTrack} On Track`,
    `${atRisk} At Risk`,
    `${blocked} Blocked`,
    `${inactiveCount} Projects Inactive 21d+`,
    'Flightpath Delivery Intelligence',
  ]

  return (
    <div className="page container">
      <header className="page-header">
        <h1 className="page-title">
          <WordReveal text="Projects Overview" />
        </h1>
        <p className="page-subtitle">{total} active delivery engagements</p>
      </header>

      {/* Marquee ticker */}
      <MarqueeStrip items={marqueeItems} />

      {/* Summary stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-on_track">{onTrack}</span>
          <span className="stat-label">On Track</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-at_risk">{atRisk}</span>
          <span className="stat-label">At Risk</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-blocked">{blocked}</span>
          <span className="stat-label">Blocked</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-completed">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-inactive">{inactiveCount}</span>
          <span className="stat-label">No Activity 21d+</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {processedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isInactive={project.isInactive}
          />
        ))}
      </div>
    </div>
  )
}
