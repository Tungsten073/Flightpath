import { useState } from 'react'
import { useData } from '../../context/DataContext'
import ProjectCard from './ProjectCard'
import WordReveal from '../../components/WordReveal'
import MarqueeStrip from '../../components/MarqueeStrip'
import AddProjectModal from '../../components/AddProjectModal'

const INACTIVE_THRESHOLD_DAYS = 21

function normalizeStatus(status) {
  if (!status) return ''
  return status.toLowerCase().replace(/\s+/g, '_')
}

function parseFlexibleDate(dateStr) {
  if (!dateStr) return null
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) return date
  return null
}

function getDaysBetween(dateStr, relativeTo = new Date('2026-08-15')) {
  if (!dateStr) return 0
  const date = parseFlexibleDate(dateStr)
  if (!date) return 0
  const diffMs = relativeTo.getTime() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export default function ProjectsOverview() {
  const { projects, tasks, issues, addProject } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const processedProjects = projects.map((p) => {
    const lastActive = p.lastActivityAt || p.lastActive || p.createdAt
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

  // Dynamic Dashboard Stats calculated from actual state
  const total = processedProjects.length
  const onTrack = processedProjects.filter((p) => p.normalizedStatus === 'on_track').length
  const atRisk = processedProjects.filter((p) => p.normalizedStatus === 'at_risk').length
  const blocked = processedProjects.filter((p) => p.normalizedStatus === 'blocked').length
  const completed = processedProjects.filter((p) => p.normalizedStatus === 'completed').length
  const inactiveCount = processedProjects.filter((p) => p.isInactive).length

  const completedTasksCount = tasks.filter((t) => t.status === 'done').length
  const openIssuesCount = issues.filter((i) => i.status !== 'closed').length

  // Live Filter & Search
  const filteredProjects = processedProjects.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatus = true
    if (statusFilter !== 'ALL') {
      matchesStatus = p.normalizedStatus === normalizeStatus(statusFilter)
    }

    return matchesSearch && matchesStatus
  })

  const marqueeItems = [
    `${total} Active Engagements`,
    `${onTrack} On Track`,
    `${atRisk} At Risk`,
    `${blocked} Blocked`,
    `${completedTasksCount} Tasks Completed`,
    `${openIssuesCount} Open Issues`,
    `${inactiveCount} Projects Inactive 21d+`,
    'Flightpath Delivery Intelligence',
  ]

  const handleCreateProject = (projectData) => {
    addProject(projectData)
  }

  return (
    <div className="page container">
      <header className="page-header flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-title">
            <WordReveal text="Projects Overview" />
          </h1>
          <p className="page-subtitle">{total} active delivery engagements</p>
        </div>

        <button
          className="btn btn-primary"
          style={{ fontSize: '0.9rem', padding: '10px 18px' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Project
        </button>
      </header>

      {/* Marquee Ticker */}
      <MarqueeStrip items={marqueeItems} />

      {/* Dynamic Summary Stats Bar */}
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

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar card mb-6 flex flex-wrap gap-4 items-center justify-between" style={{ padding: '16px' }}>
        <div className="flex-1 flex gap-3 items-center" style={{ minWidth: '260px' }}>
          <span className="font-mono text-xs font-bold uppercase" style={{ letterSpacing: '0.05em' }}>Search:</span>
          <input
            type="text"
            className="neo-input flex-1"
            placeholder="Search by project or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 items-center">
          <span className="font-mono text-xs font-bold uppercase" style={{ letterSpacing: '0.05em' }}>Status Filter:</span>
          <select
            className="neo-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses ({total})</option>
            <option value="On Track">On Track ({onTrack})</option>
            <option value="At Risk">At Risk ({atRisk})</option>
            <option value="Blocked">Blocked ({blocked})</option>
            <option value="Completed">Completed ({completed})</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isInactive={project.isInactive}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center p-8">
          <h3 className="font-display text-lg mb-2">No Projects Found</h3>
          <p className="text-muted text-sm font-mono mb-4">
            No projects matched your search "{searchTerm}" with status filter "{statusFilter}".
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('ALL')
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}
