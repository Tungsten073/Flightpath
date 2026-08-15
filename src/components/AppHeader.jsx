import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function AppHeader() {
  const { isSupabaseConfigured } = useData()

  return (
    <header className="app-header">
      <div className="app-header-inner flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="app-logo">
            Flightpath<span>.Delivery</span>
          </Link>
          <span className="text-xs text-muted font-mono" style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
            Autonomous Delivery Operations
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="ms-pill"
            style={{
              fontSize: '0.68rem',
              padding: '3px 8px',
              background: isSupabaseConfigured ? '#005C2B' : 'var(--bg-card)',
              color: isSupabaseConfigured ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1.5px solid var(--border-dark)',
            }}
            title={
              isSupabaseConfigured
                ? 'Supabase PostgreSQL connected as persistent database'
                : 'Supabase PostgreSQL integration active. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
            }
          >
            ⚡ {isSupabaseConfigured ? 'SUPABASE POSTGRESQL CONNECTED' : 'SUPABASE BACKEND READY'}
          </span>
        </div>
      </div>
    </header>
  )
}
