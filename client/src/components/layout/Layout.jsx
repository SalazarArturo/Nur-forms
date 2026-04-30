import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/nur_logo.png'
import './Layout.css'

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    roles: ['admin', 'creator'],
  },
  {
    label: 'Campañas',
    to: '/campaigns',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M2 7a2 2 0 012-2h4l2 3H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"/>
      </svg>
    ),
    roles: ['admin', 'creator'],
  },
  {
    label: 'Usuarios',
    to: '/users',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    roles: ['admin'],
  },
]

export default function Layout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <img src={logo} alt="NUR" className="sidebar__logo-img" />
          <span className="sidebar__name">FormsNUR</span>
        </div>

        <nav className="sidebar__nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.full_name}</span>
              <span className={`badge badge--${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={handleLogout} title="Cerrar sesión">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <div className="layout__main">
        <main className="layout__content">
          {children}
        </main>
      </div>
    </div>
  )
}
