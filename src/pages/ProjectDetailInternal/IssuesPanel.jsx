import { useState } from 'react'
import { useData } from '../../context/DataContext'
import AddIssueModal from '../../components/AddIssueModal'

const CATEGORY_CLASS = {
  'Bug':             'cat-bug',
  'Feature Request': 'cat-feature',
  'Question':        'cat-question',
  'Support':         'cat-support',
  'Implementation':  'cat-impl',
}

const STATUS_DOT = {
  'open':        'dot-open',
  'in progress': 'dot-progress',
  'closed':      'dot-closed',
}

export default function IssuesPanel({ projectId, issues }) {
  const { addIssue, updateIssueStatus, deleteIssue } = useData()
  const [isAddOpen, setIsAddOpen] = useState(false)

  const handleStatusToggle = (issueId, currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open'
    updateIssueStatus(issueId, nextStatus)
  }

  const handleAddIssue = (issueFields) => {
    addIssue(projectId, issueFields)
  }

  return (
    <div className="panel-section">
      <div className="panel-header flex justify-between items-center">
        <span className="panel-title"><IssueIcon />Issues</span>
        <div className="flex items-center gap-3">
          <span className="panel-count">{issues.length}</span>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            onClick={() => setIsAddOpen(true)}
          >
            + Add Issue
          </button>
        </div>
      </div>

      <div className="panel-body">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div key={issue.id} className="issue-row flex justify-between items-center py-2 border-b border-subtle">
              <div className="flex items-center gap-2 flex-1">
                <span
                  className={`issue-status-dot ${STATUS_DOT[issue.status] ?? 'dot-open'}`}
                  title={issue.status}
                />
                <span className={`issue-category-badge ${CATEGORY_CLASS[issue.category] ?? 'cat-support'}`}>
                  {issue.category}
                </span>
                <span className="issue-title font-bold text-sm">{issue.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`ms-pill ms-pill-${issue.status === 'open' ? 'blocked' : 'done'} ${issue.status === 'open' ? 'blocked' : 'done'} cursor-pointer`}
                  onClick={() => handleStatusToggle(issue.id, issue.status)}
                  title="Click to toggle status (OPEN <-> CLOSED)"
                >
                  {issue.status.toUpperCase()}
                </button>
                <button
                  type="button"
                  className="text-xs text-muted hover:text-danger ml-1"
                  onClick={() => deleteIssue(issue.id)}
                  title="Delete issue"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="panel-empty p-4 text-center">
            <p className="text-muted text-sm mb-2 font-mono">No issues reported.</p>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setIsAddOpen(true)}
            >
              + Add Issue
            </button>
          </div>
        )}
      </div>

      <AddIssueModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddIssue}
      />
    </div>
  )
}

function IssueIcon() {
  return (
    <svg className="panel-title-icon" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="13" r="0.75" fill="currentColor"/>
    </svg>
  )
}
