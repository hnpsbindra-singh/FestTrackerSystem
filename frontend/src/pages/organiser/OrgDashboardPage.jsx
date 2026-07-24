import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyEvents } from '../../api'
import { formatDate, formatTime } from '../../utils'

export default function OrgDashboardPage() {
  const navigate = useNavigate()
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['myEvents'],
    queryFn: () => getMyEvents().then(r => r.data),
  })

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="container" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Dashboard</h1>
            <p>{events.length} active event{events.length !== 1 ? 's' : ''} under management</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/organiser/create')}>
            + Create Event
          </button>
        </div>
      </div>

      {/* ── Event Grid ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {isLoading && (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 100 }} />
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 18, width: '70%' }} />
                  <div className="skeleton" style={{ height: 13 }} />
                  <div className="skeleton" style={{ height: 34, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎪</div>
            <h3>No Events Yet</h3>
            <p>Create your first event to start selling tickets.</p>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/organiser/create')}>
              Create First Event
            </button>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div className="grid-3">
            {events.map(ev => (
              <div key={ev.id} className="card card-interactive"
                onClick={() => navigate(`/organiser/event/${ev.id}`)}>
                {/* Dark header */}
                <div style={{ background: 'var(--grad-dark)', padding: '18px 20px', borderBottom: '1px solid var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <span className="badge badge-primary">{ev.genre || 'Event'}</span>
                    <span className="badge badge-dark">Active</span>
                  </div>
                  <div style={{ color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 4, lineHeight: 1.3 }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-white-muted)' }}>
                    {formatDate(ev.date)} · {formatTime(ev.time)}
                  </div>
                </div>
                {/* Card body */}
                <div className="card-body">
                  <p style={{ fontSize: '0.82rem', marginBottom: 16, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {ev.detailedAddress?.slice(0, 70)}{ev.detailedAddress?.length > 70 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/organiser/event/${ev.id}`) }}>
                      Manage
                    </button>
                    <button className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/organiser/event/${ev.id}/scan`) }}>
                      Scanner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
