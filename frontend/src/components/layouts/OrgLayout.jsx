import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function OrgLayout() {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallPwa = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
    } else {
      toast('To install: Click your browser menu (⋮ or share button) and select "Add to Home Screen" or "Install App".', {
        icon: '📱',
        duration: 5000,
      })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo" onClick={() => navigate('/organiser')} style={{ cursor: 'pointer' }}>
            FestTracker <span className="navbar-logo-badge">Organiser</span>
          </div>
          <div className="navbar-nav">
            <NavLink to="/organiser" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/organiser/create" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Create Event
            </NavLink>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleInstallPwa}
              style={{ fontSize: '0.78rem', padding: '4px 10.5px' }}
            >
              Install App
            </button>
            <div style={{ width: 1, height: 20, background: '#334155', margin: '0 6px' }} />
            <span style={{ fontSize: '0.825rem', color: '#94a3b8', fontWeight: 600 }}>
              {username}
            </span>
            <button className="btn btn-sm btn-secondary" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }} onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="mobile-bottom-nav">
        <NavLink to="/organiser" end className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/organiser/create" className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
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
