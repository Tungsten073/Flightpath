import { NavLink } from 'react-router-dom'

export default function NavTabs({ tabs, projectId }) {
  const list = tabs || [
    { label: 'Internal View', to: `/project/${projectId}` },
    { label: 'Customer View', to: `/project/${projectId}/customer` },
  ]

  return (
    <nav className="nav-tabs" aria-label="View switcher">
      {list.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
