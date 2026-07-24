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
      <div className="page-hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>Organiser Dashboard</h1>
            <p>{events.length} total event{events.length !== 1 ? 's' : ''} under management</p>
          </div>
          <button className="btn btn-primary btn-lg"
            onClick={() => navigate('/organiser/create')}>
            Create Event
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        {isLoading && (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 90 }} />
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 18, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="empty-state">
            <h3>No Active Events</h3>
            <p>Get started by creating your first event to publish ticket options.</p>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/organiser/create')}>
              Create Event
            </button>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div className="grid-3">
            {events.map(ev => (
              <div key={ev.id} className="card" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/organiser/event/${ev.id}`)}>
                <div style={{ background: '#0f172a', padding: '20px', borderBottom: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span className="badge badge-primary">{ev.genre || 'Event'}</span>
                    <span className="badge badge-muted" style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Active</span>
                  </div>
                  <div style={{ color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                    {formatDate(ev.date)} &bull; {formatTime(ev.time)}
                  </div>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: '0.825rem', marginBottom: 14, color: 'var(--text-secondary)' }}>
                    {ev.detailedAddress?.slice(0, 60)}{ev.detailedAddress?.length > 60 ? '...' : ''}
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
