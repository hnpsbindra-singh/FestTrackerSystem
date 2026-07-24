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
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
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

  const events = data?.content || []
  const totalPages = data?.totalPages || 0

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1 style={{ marginBottom: 6 }}>Discover Nearby Events</h1>
          <p style={{ marginBottom: 24, fontSize: '1.05rem' }}>Explore and reserve tickets for upcoming events in your area</p>
          
          <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 150px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Latitude</div>
                <input className="form-input" type="number" step="0.0001" value={lat}
                  onChange={e => setLat(parseFloat(e.target.value))} />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Longitude</div>
                <input className="form-input" type="number" step="0.0001" value={lng}
                  onChange={e => setLng(parseFloat(e.target.value))} />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Radius: {radius} km</div>
                <input type="range" className="range-slider" min={1} max={100} value={radius}
                  onChange={e => setRadius(parseInt(e.target.value))} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={useMyLocation}>Use Current Location</button>
                <button className="btn btn-primary" onClick={handleSearch}>Search Events</button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Cities:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: '1 1 auto' }}>
                {INDIAN_CITIES.slice(0, 5).map(city => (
                  <button
                    key={city.name}
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '3px 10px' }}
                    onClick={() => {
                      setLat(city.lat)
                      setLng(city.lng)
                      setPage(0)
                      setSearched(true)
                      setTimeout(() => refetch(), 50)
                    }}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: 200, padding: '4px 28px 4px 10px', fontSize: '0.825rem' }}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [la, lo] = e.target.value.split(',').map(Number)
                  setLat(la)
                  setLng(lo)
                  setPage(0)
                  setSearched(true)
                  setTimeout(() => refetch(), 50)
                }}
                value=""
              >
                <option value="">Select City (40+ Cities)...</option>
                {INDIAN_CITIES.map(c => (
                  <option key={c.name} value={`${c.lat},${c.lng}`}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        {searched && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              {isLoading ? <span className="badge badge-muted">Searching...</span>
                : <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Showing {data?.totalElements || 0} events
                  </span>
              }
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>Grid View</button>
              <button className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('map')}>Map View</button>
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', height: 420, border: '1px solid var(--border)' }}>
            <MapContainer center={[lat, lng]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              <LocationMarker onPick={(la, lo) => { setLat(la); setLng(lo) }} />
              <Circle center={[lat, lng]} radius={radius * 1000} color="#4f46e5" fillColor="#4f46e5" fillOpacity={0.08} />
              <Marker position={[lat, lng]}>
                <Popup>Your location</Popup>
              </Marker>
              {events.map(ev => (
                <Marker key={ev.id} position={[DEFAULT_LAT + Math.random() * 0.1, DEFAULT_LNG + Math.random() * 0.1]}>
                  <Popup>
                    <strong>{ev.title}</strong><br />
                    {formatDate(ev.date)}<br />
                    <button onClick={() => navigate(`/app/event/${ev.id}`)} style={{ marginTop: 8, padding: '4px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>View Details</button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {!searched && (
          <div className="empty-state">
            <h3 style={{ fontSize: '1.25rem' }}>Search for Events Nearby</h3>
            <p style={{ marginTop: 4 }}>Select your coordinates or use current location to discover events</p>
            <button className="btn btn-primary mt-16" onClick={useMyLocation}>Use Current Location</button>
          </div>
        )}

        {isLoading && (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 120 }} />
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 18, width: '75%' }} />
                  <div className="skeleton" style={{ height: 14, width: '50%' }} />
                  <div className="skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && searched && events.length === 0 && (
          <div className="empty-state">
            <h3>No events found in this area</h3>
            <p>Try expanding your search radius or changing location coordinates.</p>
          </div>
        )}

        {!isLoading && events.length > 0 && (
          <div className="grid-3">
            {events.map((ev, idx) => (
              <EventCard key={ev.id} event={ev} idx={idx} onClick={() => navigate(`/app/event/${ev.id}`)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={`page-btn${page === i ? ' active' : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
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
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{event.language}</div>
        </div>
      </div>
      <div className="event-card-body">
        <div>
          <div className="event-card-title">{event.title}</div>
          <div className="event-card-meta">
            <span className="badge badge-muted">{formatDate(event.date)}</span>
            <span className="badge badge-muted">{formatTime(event.time)}</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
            {truncate(event.detailedAddress, 55)}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm btn-block">View Details</button>
      </div>
    </div>
  )
}
