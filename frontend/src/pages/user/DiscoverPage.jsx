import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import { findNearbyEvents } from '../../api'
import { genreBadgeColor, formatDate, formatTime, truncate, INDIAN_CITIES } from '../../utils'

const DEFAULT_LAT = 28.6139
const DEFAULT_LNG = 77.2090

function LocationMarker({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [lat, setLat] = useState(DEFAULT_LAT)
  const [lng, setLng] = useState(DEFAULT_LNG)
  const [radius, setRadius] = useState(10)
  const [page, setPage] = useState(0)
  const [viewMode, setViewMode] = useState('grid')
  const [searched, setSearched] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['nearbyEvents', lat, lng, radius, page],
    queryFn: () => findNearbyEvents(lat, lng, radius, page, 12).then(r => r.data),
    enabled: searched,
  })

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude)
      setLng(pos.coords.longitude)
      setSearched(true)
      setTimeout(() => refetch(), 100)
    })
  }

  const handleSearch = () => {
    setPage(0)
    setSearched(true)
    setTimeout(() => refetch(), 50)
  }

  const handleCityPick = (la, lo) => {
    setLat(la)
    setLng(lo)
    setPage(0)
    setSearched(true)
    setTimeout(() => refetch(), 50)
  }

  const events = data?.content || []
  const totalPages = data?.totalPages || 0

  return (
    <div>
      {/* ── Hero / Search ── */}
      <div className="page-hero">
        <div className="container">
          <h1 style={{ marginBottom: 6 }}>Discover Events</h1>
          <p style={{ marginBottom: 24 }}>Explore events near you and reserve tickets instantly</p>

          {/* Search Box */}
          <div style={{
            background: 'white', borderRadius: 'var(--r-xl)',
            padding: '20px', boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* Coordinates + Radius row */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 130px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Latitude</div>
                <input className="form-input" type="number" step="0.0001" value={lat}
                  onChange={e => setLat(parseFloat(e.target.value))} />
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Longitude</div>
                <input className="form-input" type="number" step="0.0001" value={lng}
                  onChange={e => setLng(parseFloat(e.target.value))} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Radius: {radius} km</div>
                <input type="range" className="range-slider" min={1} max={100} value={radius}
                  onChange={e => setRadius(parseInt(e.target.value))} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={useMyLocation}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                    <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                  </svg>
                  My Location
                </button>
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
              </div>
            </div>

            {/* Quick Cities */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Quick:</span>
              <div className="quick-cities-scroll" style={{ flex: '1 1 auto' }}>
                {INDIAN_CITIES.slice(0, 6).map(city => (
                  <button key={city.name} type="button" className="btn btn-sm btn-secondary"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                    onClick={() => handleCityPick(city.lat, city.lng)}>
                    {city.name}
                  </button>
                ))}
              </div>
              <select className="form-select"
                style={{ width: 'auto', minWidth: 160, flex: '1 1 160px', padding: '8px 28px 8px 12px', fontSize: '0.825rem' }}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [la, lo] = e.target.value.split(',').map(Number)
                  handleCityPick(la, lo)
                }}
                value="">
                <option value="">More cities...</option>
                {INDIAN_CITIES.map(c => (
                  <option key={c.name} value={`${c.lat},${c.lng}`}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {/* Toolbar */}
        {searched && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {isLoading ? <span className="badge badge-muted">Searching...</span>
                : `${data?.totalElements || 0} events found`}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('grid')}>Grid</button>
              <button className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('map')}>Map</button>
            </div>
          </div>
        )}

        {/* Map view */}
        {viewMode === 'map' && searched && (
          <div style={{ marginBottom: 28, borderRadius: 'var(--r-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', height: 'clamp(260px, 48vh, 420px)', border: '1px solid var(--border)' }}>
            <MapContainer center={[lat, lng]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              <LocationMarker onPick={(la, lo) => { setLat(la); setLng(lo) }} />
              <Circle center={[lat, lng]} radius={radius * 1000} color="#6366f1" fillColor="#6366f1" fillOpacity={0.07} />
              <Marker position={[lat, lng]}>
                <Popup>Your location</Popup>
              </Marker>
              {events.map(ev => (
                <Marker key={ev.id} position={[DEFAULT_LAT + Math.random() * 0.1, DEFAULT_LNG + Math.random() * 0.1]}>
                  <Popup>
                    <strong>{ev.title}</strong><br />
                    {formatDate(ev.date)}<br />
                    <button onClick={() => navigate(`/app/event/${ev.id}`)}
                      style={{ marginTop: 8, padding: '4px 12px', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>
                      View Details
                    </button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Empty prompt */}
        {!searched && (
          <div className="empty-state">
            <h3>Find Events Near You</h3>
            <p style={{ marginTop: 4 }}>Select your location or use the quick city buttons above to discover events</p>
            <button className="btn btn-primary mt-16" onClick={useMyLocation}>Use Current Location</button>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 110 }} />
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 18, width: '75%' }} />
                  <div className="skeleton" style={{ height: 13, width: '50%' }} />
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                  <div className="skeleton" style={{ height: 34, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && searched && events.length === 0 && (
          <div className="empty-state">
            <h3>No Events Found</h3>
            <p>Try expanding your search radius or selecting a different city.</p>
          </div>
        )}

        {/* Event grid */}
        {!isLoading && events.length > 0 && (
          <div className="grid-3">
            {events.map((ev, idx) => (
              <EventCard key={ev.id} event={ev} idx={idx} onClick={() => navigate(`/app/event/${ev.id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, onClick, idx }) {
  return (
    <div className="event-card animate-fadeIn" onClick={onClick} style={{ animationDelay: `${idx * 0.04}s` }}>
      <div className="event-card-banner">
        <div>
          <span className={`badge ${genreBadgeColor(event.genre)}`} style={{ marginBottom: 6 }}>{event.genre}</span>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>{event.language}</div>
        </div>
      </div>
      <div className="event-card-body">
        <div>
          <div className="event-card-title">{event.title}</div>
          <div className="event-card-meta" style={{ marginTop: 8 }}>
            <span className="badge badge-muted">{formatDate(event.date)}</span>
            <span className="badge badge-muted">{formatTime(event.time)}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            {truncate(event.detailedAddress, 60)}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 4 }}>View Details →</button>
      </div>
    </div>
  )
}
