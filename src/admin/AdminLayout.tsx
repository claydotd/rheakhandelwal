import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { getAdminToken, logoutAdmin } from '../content/auth'
import { isLocalBackend } from '../content/backend'
import AdminLogin from './AdminLogin'
import './admin.css'

const tabs = [
  { to: '/admin', label: 'Home', end: true },
  { to: '/admin/how-i-work', label: 'How I Work' },
  { to: '/admin/fees', label: 'Fees' },
  { to: '/admin/about', label: 'About Me' },
  { to: '/admin/contact', label: 'Contact' },
  { to: '/admin/faq', label: 'FAQ' },
  { to: '/admin/privacy', label: 'Privacy Policy' },
]

export default function AdminLayout() {
  const local = isLocalBackend()
  const [authed, setAuthed] = useState(() => local || Boolean(getAdminToken()))

  if (!local && !authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="admin-shell">
      {local ? (
        <p className="admin-banner">
          Prototype mode: Changes save only to this browser. Changes are not saved to the server.
        </p>
      ) : null}
      <header className="admin-header">
        <h1>Site admin</h1>
        <div className="admin-header__actions">
          <NavLink to="/">View site</NavLink>
          {!local ? (
            <button
              type="button"
              onClick={() => {
                logoutAdmin()
                setAuthed(false)
              }}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {tabs.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
