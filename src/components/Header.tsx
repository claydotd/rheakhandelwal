import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Header.css'

const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-i-work', label: 'How I Work' },
  { to: '/fees', label: 'Fees' },
  { to: '/about', label: 'About Me' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return

    const setHeight = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${el.getBoundingClientRect().height}px`,
      )
    }

    setHeight()
    const observer = new ResizeObserver(setHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const media = window.matchMedia('(min-width: 48rem)')
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onBreakpoint)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onBreakpoint)
    }
  }, [menuOpen])

  return (
    <header
      className={`site-header${menuOpen ? ' is-menu-open' : ''}`}
      ref={headerRef}
    >
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__brand" end>
          Rhea Khandelwal Psychotherapy
        </NavLink>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-header-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <nav
          id="site-header-nav"
          className="site-header__nav"
          aria-label="Primary"
        >
          <ul>
            {navItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? 'is-active' : undefined
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
