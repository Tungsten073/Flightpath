const CHANNEL_CLASS = {
  email: 'channel-email',
  chat:  'channel-chat',
  call:  'channel-call',
}

const CHANNEL_ICON = {
  email: '✉',
  chat:  '💬',
  call:  '📞',
}

function formatTimestamp(ts) {
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RawUpdatesPanel({ updates }) {
  if (!updates.length) {
    return (
      <div className="panel-section">
        <div className="panel-header">
          <span className="panel-title"><UpdateIcon />Raw Updates</span>
        </div>
        <div className="panel-empty">No raw updates for this project.</div>
      </div>
    )
  }

  // Sort newest first
  const sorted = [...updates].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div className="panel-section">
      <div className="panel-header">
        <span className="panel-title"><UpdateIcon />Raw Updates</span>
        <span className="panel-count">{updates.length}</span>
      </div>
      <div className="panel-body">
        {sorted.map((upd) => (
          <div key={upd.id} className="update-card">
            <div className="update-header">
              <span className={`channel-badge ${CHANNEL_CLASS[upd.channel] ?? 'channel-email'}`}>
                <span>{CHANNEL_ICON[upd.channel] ?? '📄'}</span>
                {upd.channel}
              </span>
              <span className="update-timestamp">{formatTimestamp(upd.timestamp)}</span>
            </div>
            <p className="update-text">{upd.rawText}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function UpdateIcon() {
  return (
    <svg className="panel-title-icon" viewBox="0 0 20 20" fill="none">
      <path d="M3 4h14M3 8h10M3 12h12M3 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
