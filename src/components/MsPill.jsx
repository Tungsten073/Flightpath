/**
 * MsPill — small status pill for milestone / task status
 * status: "done" | "open" | "blocked"
 */
export default function MsPill({ status }) {
  const labels = { done: 'Done', open: 'Open', blocked: 'Blocked' }
  return (
    <span className={`ms-pill ${status}`}>
      {labels[status] ?? status}
    </span>
  )
}
