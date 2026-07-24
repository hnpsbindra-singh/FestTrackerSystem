import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function OrgLayout() {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  React.useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallPwa = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
    } else {
      toast('Tap your browser menu and choose "Add to Home Screen".', { icon: '📱', duration: 5000 })
    }
  }

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo" onClick={() => navigate('/organiser')} style={{ cursor: 'pointer' }}>
            <span style={{ fontSize: '1.1rem' }}>🎪</span> FestTracker
            <span className="navbar-logo-badge">Organiser</span>
          </div>
          {/* Desktop nav */}
          <div className="navbar-nav">
            <NavLink to="/organiser" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/organiser/create" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Create Event
            </NavLink>
            <button className="btn btn-sm btn-primary" onClick={handleInstallPwa}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
              Install App
            </button>
            <div style={{ width: 1, height: 18, background: '#334155', margin: '0 4px' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{username}</span>
            <button className="btn btn-sm btn-dark" onClick={handleLogout}>Sign Out</button>
          </div>
          {/* Mobile top-right */}
          <div className="navbar-mobile-nav">
            <span className="navbar-mobile-username">{username}</span>
            <button className="btn-logout-icon" onClick={handleLogout} title="Sign Out">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="mobile-bottom-nav">
        <NavLink to="/organiser" end className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/organiser/create" className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span>Create</span>
        </NavLink>
        <a href="#" className="mobile-bottom-nav-link" onClick={(e) => { e.preventDefault(); handleInstallPwa() }}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Install</span>
        </a>
      </div>

      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
    </>
  )
}
