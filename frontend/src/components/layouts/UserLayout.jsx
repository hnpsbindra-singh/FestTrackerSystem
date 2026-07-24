import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function UserLayout() {
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
          <div className="navbar-logo" onClick={() => navigate('/app')} style={{ cursor: 'pointer' }}>
            FestTracker
          </div>
          <div className="navbar-nav">
            <NavLink to="/app" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Discover Events
            </NavLink>
            <NavLink to="/app/bookings" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              My Tickets
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
        <NavLink to="/app" end className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Discover</span>
        </NavLink>
        <NavLink to="/app/bookings" className={({ isActive }) => 'mobile-bottom-nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span>My Tickets</span>
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
