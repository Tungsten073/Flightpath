export default function StatusBadge({ status }) {
  if (!status) return null

  const s = status.toLowerCase().replace(/\s+/g, '_')
  const labels = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    blocked: 'Blocked',
    completed: 'Completed',
  }

  const label = labels[s] || status

  return (
    <span className={`badge status-${s}`}>
      {label}
    </span>
  )
}
