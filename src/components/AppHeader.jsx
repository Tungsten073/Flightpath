import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function AppHeader() {
  const { isSupabaseConfigured, error } = useData()

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
          {error ? (
            <span
              className="ms-pill"
              style={{
                fontSize: '0.68rem',
                padding: '4px 10px',
                background: '#8B0000',
                color: '#FFFFFF',
                border: '2px solid #5A0000',
                fontWeight: 700,
              }}
              title={error}
            >
              ⚠ DATABASE ERROR: {error}
            </span>
          ) : isSupabaseConfigured ? (
            <span
              className="ms-pill"
              style={{
                fontSize: '0.68rem',
                padding: '4px 10px',
                background: '#005C2B',
                color: '#FFFFFF',
                border: '2px solid #003B1B',
                fontWeight: 700,
              }}
              title="Supabase PostgreSQL is connected as the primary database"
            >
              ⚡ SUPABASE POSTGRESQL CONNECTED
            </span>
          ) : (
            <span
              className="ms-pill"
              style={{
                fontSize: '0.68rem',
                padding: '4px 10px',
                background: '#854D0E',
                color: '#FEF08A',
                border: '2px solid #713F12',
                fontWeight: 700,
              }}
              title="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env"
            >
              ⚠ DATABASE OFFLINE / CONFIGURATION REQUIRED
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
