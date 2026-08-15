import { useState } from 'react'
import { useUpdates } from '../../context/UpdatesContext'
import MsPill from '../../components/MsPill'

const CONFIDENCE_CLASS = {
  high:   'conf-high',
  medium: 'conf-medium',
  low:    'conf-low',
}

function formatTs(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AIUpdateCard({ entry }) {
  const [rawOpen, setRawOpen] = useState(false)
  const { parsed } = entry

  return (
    <div className="ai-update-card">
      {/* Top row: timestamp + confidence */}
      <div className="ai-update-header">
        <div className="flex items-center gap-3">
          <span className="ai-badge">
            <SparkleIcon />
            AI Parsed
          </span>
          <span className="update-timestamp">{formatTs(entry.timestamp)}</span>
        </div>
        <span className={`conf-badge ${CONFIDENCE_CLASS[parsed.confidence] ?? 'conf-medium'}`}>
          {parsed.confidence} confidence
        </span>
      </div>

      {/* Summary — customer-safe headline */}
      <div className="ai-summary">{parsed.summary}</div>

      {/* Match info */}
      <div className="ai-matches">
        {parsed.milestoneName && (
          <div className="ai-match-row">
            <span className="ai-match-label">Milestone</span>
            <span className="ai-match-value">{parsed.milestoneName}</span>
          </div>
        )}
        {parsed.taskName && (
          <div className="ai-match-row">
            <span className="ai-match-label">Task</span>
            <span className="ai-match-value">{parsed.taskName}</span>
          </div>
        )}
        {parsed.inferredStatus && (
          <div className="ai-match-row">
            <span className="ai-match-label">Status →</span>
            <MsPill status={parsed.inferredStatus} />
          </div>
        )}
        {!parsed.milestoneName && !parsed.taskName && (
          <div className="ai-match-row">
            <span className="ai-match-label" style={{ color: 'var(--text-faint)' }}>
              No milestone/task matched
            </span>
          </div>
        )}
      </div>

      {/* Raw text toggle */}
      <button
        className="ai-raw-toggle"
        onClick={() => setRawOpen((o) => !o)}
        type="button"
      >
        {rawOpen ? '▲ Hide raw text' : '▼ Show raw text'}
      </button>
      {rawOpen && (
        <div className="update-text" style={{ marginTop: '8px', fontSize: '0.82rem' }}>
          {entry.rawText}
        </div>
      )}
    </div>
  )
}

export default function AIParsedUpdatesPanel({ projectId }) {
  const { getUpdates } = useUpdates()
  const updates = getUpdates(projectId)

  if (!updates.length) return null

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title">
          <SparkleIcon size={18} />
          AI-Parsed Updates
        </span>
        <span className="panel-count">{updates.length}</span>
      </div>
      <div className="panel-body">
        {updates.map((entry) => (
          <AIUpdateCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function SparkleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11l-1.2-3.8L3 6l3.8-1.2L8 1z" fill="currentColor"/>
      <path d="M13 11l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}
