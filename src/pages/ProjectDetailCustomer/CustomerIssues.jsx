/**
 * CustomerIssues (customer view)
 *
 * Filters out internal-only categories: "Bug"
 * Visible categories: Feature Request, Question, Support, Implementation
 * Bug-category issues are internal triage items, not customer-actionable.
 */

const INTERNAL_CATEGORIES = new Set(['Bug'])

const CATEGORY_CLASS = {
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

export default function CustomerIssues({ issues }) {
  const visible = issues.filter(
    (i) => !INTERNAL_CATEGORIES.has(i.category) && i.status !== 'closed'
  )

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title"><IssueIcon />Open Items</span>
        {visible.length > 0 && (
          <span className="panel-count">{visible.length}</span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="panel-empty">
          No open items requiring your attention. 🎉
        </div>
      ) : (
        <div className="panel-body">
          {visible.map((issue) => (
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
      )}
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
