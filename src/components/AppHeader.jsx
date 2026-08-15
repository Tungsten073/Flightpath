import { Link } from 'react-router-dom'

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="app-logo">
          Flightpath<span>.Delivery</span>
        </Link>
        <span className="text-xs text-muted font-mono" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
          Autonomous Delivery Operations
        </span>
      </div>
    </header>
  )
}
