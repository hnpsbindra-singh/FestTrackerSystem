import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getEventDetails, getEventSeating } from '../../api'
import { formatDate, formatTime, formatCurrency } from '../../utils'

export default function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [slots, setSlots] = useState(1)

  const { data: event, isLoading: evLoading } = useQuery({
    queryKey: ['eventDetail', eventId],
    queryFn: () => getEventDetails(eventId).then(r => r.data),
  })

  const { data: seats = [], isLoading: seatsLoading } = useQuery({
    queryKey: ['eventSeats', eventId],
    queryFn: () => getEventSeating(eventId).then(r => r.data),
  })

  if (evLoading) return (
    <div style={{ paddingTop: 'var(--navbar-h)' }}>
      <div style={{ height: 200, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }} />
      </div>
      <div className="container" style={{ paddingTop: 28 }}>
        <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '70%' }} />
      </div>
    </div>
  )

  if (!event) return null

  const handleBookNow = () => {
    if (!selectedSeat) return
    navigate('/app/checkout', {
      state: {
        festId: eventId,
        seatingTypeId: selectedSeat.id,
        seatingName: selectedSeat.name,
        slots,
        totalCost: selectedSeat.price * slots,
        festTitle: event.title,
      }
    })
  }

  const isExpired = !event.active

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied to clipboard')
    }
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{event.genre}</span>
                <span className="badge badge-dark">Lang: {event.language}</span>
                {event.ageLimit > 0 && <span className="badge badge-dark">{event.ageLimit}+ only</span>}
                {isExpired && <span className="badge badge-danger">Cancelled</span>}
              </div>
              <h1 style={{ color: 'white', marginBottom: 6 }}>{event.title}</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Organised by {event.organiserName}</p>
            </div>
            <button className="btn btn-dark btn-sm" onClick={handleShare} style={{ flexShrink: 0 }}>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="detail-grid">
          {/* Left: Info + Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Event info card */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 18 }}>Event Details</h3>
                <div className="info-grid">
                  {[
                    { label: 'Date', value: formatDate(event.date) },
                    { label: 'Time', value: formatTime(event.time) },
                    { label: 'Duration', value: event.duration },
                    { label: 'Language', value: event.language },
                  ].map(row => (
                    <div key={row.label} className="info-row" style={{ padding: '10px 0', border: 'none', borderBottom: '1px solid var(--border)' }}>
                      <div className="info-row-content">
                        <div className="info-row-label">{row.label}</div>
                        <div className="info-row-value">{row.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Venue as full-width row */}
                <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <div className="info-row-label">Venue Address</div>
                  <div className="info-row-value" style={{ marginTop: 4 }}>{event.detailedAddress}</div>
                </div>
              </div>
            </div>

            {/* About card */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 14 }}>About this Event</h3>
                <p style={{ lineHeight: 1.75, fontSize: '0.9rem' }}>{event.description}</p>
              </div>
            </div>
          </div>

          {/* Right: Booking panel (sticky on desktop) */}
          <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 20px)' }}>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 16 }}>Select Category</h3>

                {seatsLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--r-lg)' }} />)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    {seats.map(seat => {
                      const isSoldOut = seat.availableSeats === 0
                      const bookedSeats = seat.totalSeats - seat.availableSeats
                      const occupancyPct = seat.totalSeats > 0 ? Math.round((bookedSeats / seat.totalSeats) * 100) : 0
                      return (
                        <div key={seat.id}
                          className={`seating-card${selectedSeat?.id === seat.id ? ' selected' : ''}${isSoldOut ? ' disabled' : ''}`}
                          onClick={() => !isSoldOut && setSelectedSeat(seat)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{seat.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {selectedSeat?.id === seat.id && <span style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 700 }}>✓ Selected</span>}
                              <div className="price-tag" style={{ fontSize: '1rem' }}>{formatCurrency(seat.price)}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: isSoldOut ? 'var(--danger)' : 'var(--text-muted)', marginBottom: 8 }}>
                            {isSoldOut ? 'Sold Out' : `${seat.availableSeats} of ${seat.totalSeats} available`}
                          </div>
                          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${occupancyPct}%`, borderRadius: 2,
                              background: occupancyPct > 85 ? 'var(--danger)' : occupancyPct > 60 ? 'var(--warning)' : 'var(--primary)',
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedSeat && (
                  <div style={{ marginBottom: 18 }}>
                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Quantity</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-secondary btn-icon"
                          onClick={() => setSlots(s => Math.max(1, s - 1))}>−</button>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 28, textAlign: 'center' }}>{slots}</span>
                        <button className="btn btn-secondary btn-icon"
                          onClick={() => setSlots(s => Math.min(selectedSeat.availableSeats, s + 1))}>+</button>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Max: {selectedSeat.availableSeats}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Total ({slots} × {formatCurrency(selectedSeat.price)})
                      </span>
                      <span className="price-tag" style={{ fontSize: '1.2rem' }}>{formatCurrency(selectedSeat.price * slots)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={!selectedSeat || isExpired}
                  onClick={handleBookNow}>
                  {isExpired ? 'Event Cancelled' : selectedSeat
                    ? `Book Now — ${formatCurrency(selectedSeat.price * slots)}`
                    : 'Select a Category'}
                </button>
                {!selectedSeat && !isExpired && (
                  <p style={{ textAlign: 'center', marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Choose a seat category above to proceed
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
