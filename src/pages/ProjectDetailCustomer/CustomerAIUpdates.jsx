import { useUpdates } from '../../context/UpdatesContext'
import MsPill from '../../components/MsPill'

function formatTs(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/**
 * CustomerAIUpdates — customer-facing feed of AI-parsed updates.
 * Shows only: date, customer-safe summary, and inferred status change.
 * No raw text, no confidence, no internal IDs.
 */
export default function CustomerAIUpdates({ projectId }) {
  const { getUpdates } = useUpdates()
  const updates = getUpdates(projectId)

  if (!updates.length) return null

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title">
          <UpdateIcon />
          Recent Updates
        </span>
        <span className="panel-count">{updates.length}</span>
      </div>
      <div className="panel-body">
        {updates.map((entry) => (
          <div key={entry.id} className="customer-ai-update-row">
            <div className="customer-ai-update-meta">
              <span className="ai-badge ai-badge--sm">
                <SparkleIcon size={11} />
                AI Summary
              </span>
              <span className="update-timestamp">{formatTs(entry.timestamp)}</span>
            </div>
            <p className="customer-ai-summary">{entry.parsed.summary}</p>
            <div className="flex items-center gap-3" style={{ marginTop: '6px' }}>
              {entry.parsed.milestoneName && (
                <span className="text-xs text-muted">
                  {entry.parsed.milestoneName}
                </span>
              )}
              {entry.parsed.inferredStatus && (
                <MsPill status={entry.parsed.inferredStatus} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpdateIcon() {
  return (
    <svg className="panel-title-icon" viewBox="0 0 20 20" fill="none">
      <path d="M3 4h14M3 8h10M3 12h12M3 16h8"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function SparkleIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11l-1.2-3.8L3 6l3.8-1.2L8 1z" fill="currentColor"/>
    </svg>
  )
}
