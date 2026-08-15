import { Link } from 'react-router-dom'

export default function Breadcrumb({ crumbs, items }) {
  const list = crumbs || items || []

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {list.map((crumb, i) => {
        const isLast = i === list.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="breadcrumb-separator">/</span>}
            {isLast || !crumb.to ? (
              <span className="crumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
