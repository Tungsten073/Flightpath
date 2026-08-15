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

export default function IssuesPanel({ issues }) {
  if (!issues.length) {
    return (
      <div className="panel-section">
        <div className="panel-header">
          <span className="panel-title"><IssueIcon />Issues</span>
        </div>
        <div className="panel-empty">No issues for this project.</div>
      </div>
    )
  }

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title"><IssueIcon />Issues</span>
        <span className="panel-count">{issues.length}</span>
      </div>
      <div className="panel-body">
        {issues.map((issue) => (
          <div key={issue.id} className="issue-row">
            <span
              className={`issue-status-dot ${STATUS_DOT[issue.status] ?? 'dot-open'}`}
              title={issue.status}
            />
            <span className={`issue-category-badge ${CATEGORY_CLASS[issue.category] ?? 'cat-support'}`}>
              {issue.category}
            </span>
            <span className="issue-title">{issue.title}</span>
            <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>
              {issue.status}
            </span>
          </div>
        ))}
      </div>
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
