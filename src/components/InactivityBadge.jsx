export default function InactivityBadge({ days, lastActivityAt }) {
  let numDays = days

  if (numDays === undefined && lastActivityAt) {
    const d = new Date(lastActivityAt)
    if (!isNaN(d.getTime())) {
      const relativeTo = new Date('2026-08-15')
      numDays = Math.max(0, Math.floor((relativeTo.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)))
    }
  }

  if (numDays === undefined || numDays < 21) return null

  return (
    <span className="inactivity-badge" title={`Last activity: ${lastActivityAt || ''}`}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {numDays}d no activity
    </span>
  )
}
