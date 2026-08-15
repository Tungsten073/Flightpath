/**
 * MsPill — small status pill for milestone / task status
 * status: "done" | "open" | "blocked"
 */
export default function MsPill({ status }) {
  const normalized = (status || '').toLowerCase()
  const labels = { done: 'DONE', open: 'OPEN', blocked: 'BLOCKED' }
  const labelText = labels[normalized] || (status ? status.toUpperCase() : '')

  return (
    <span className={`ms-pill ms-pill-${normalized} ${normalized}`}>
      {labelText}
    </span>
  )
}
