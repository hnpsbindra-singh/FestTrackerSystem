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
      <div className="container" style={{ padding: '24px 20px' }}>
        <div className="skeleton" style={{ height: 28, width: '50%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
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
      <div className="page-hero">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{event.genre}</span>
                <span className="badge badge-muted" style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Language: {event.language}</span>
                {event.ageLimit > 0 && <span className="badge badge-muted" style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>Age Limit: {event.ageLimit}+</span>}
                {isExpired && <span className="badge badge-danger">Cancelled</span>}
              </div>
              <h1 style={{ color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: 4 }}>{event.title}</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Organised by {event.organiserName}</p>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={handleShare} style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
              Share Event
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px,360px)', gap: 24, alignItems: 'start' }}>
          <div>
            <div className="card mb-24">
              <div className="card-body">
                <h3 style={{ marginBottom: 16 }}>Event Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Date', value: formatDate(event.date) },
                    { label: 'Time', value: formatTime(event.time) },
                    { label: 'Duration', value: event.duration },
                    { label: 'Venue Address', value: event.detailedAddress },
                  ].map(row => (
                    <div key={row.label} style={{ gridColumn: row.label === 'Venue Address' ? 'span 2' : 'auto' }}>
                      <div className="info-row-label">{row.label}</div>
                      <div className="info-row-value">{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 10 }}>About this Event</h3>
                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.925rem' }}>{event.description}</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 20px)' }}>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 14 }}>Select Category</h3>

                {seatsLoading ? (
                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-md)' }} />)}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {seats.map(seat => {
                      const isSoldOut = seat.availableSeats === 0
                      const bookedSeats = seat.totalSeats - seat.availableSeats
                      const occupancyPct = seat.totalSeats > 0 ? Math.round((bookedSeats / seat.totalSeats) * 100) : 0
                      return (
                        <div key={seat.id}
                          className={`seating-card${selectedSeat?.id === seat.id ? ' selected' : ''}${isSoldOut ? ' disabled' : ''}`}
                          onClick={() => !isSoldOut && setSelectedSeat(seat)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{seat.name}</div>
                            <div className="price-tag" style={{ fontSize: '1.05rem' }}>{formatCurrency(seat.price)}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ fontSize: '0.78rem', color: isSoldOut ? 'var(--danger)' : 'var(--text-muted)' }}>
                              {isSoldOut ? 'Sold Out' : `${seat.availableSeats} of ${seat.totalSeats} seats available`}
                            </div>
                            {selectedSeat?.id === seat.id && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Selected</span>}
                          </div>
                          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${occupancyPct}%`,
                              background: occupancyPct > 85 ? 'var(--danger)' : occupancyPct > 60 ? 'var(--warning)' : 'var(--primary)',
                              borderRadius: 2, transition: 'width 0.4s ease'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 2 }}>
                            {occupancyPct}% booked
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedSeat && (
                  <div style={{ marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => setSlots(s => Math.max(1, s - 1))}>-</button>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 24, textAlign: 'center' }}>{slots}</span>
                        <button className="btn btn-secondary btn-icon" onClick={() => setSlots(s => Math.min(selectedSeat.availableSeats, s + 1))}>+</button>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max: {selectedSeat.availableSeats}</span>
                      </div>
                    </div>
                    <div className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total ({slots} × {formatCurrency(selectedSeat.price)})</span>
                      <span className="price-tag" style={{ fontSize: '1.25rem' }}>{formatCurrency(selectedSeat.price * slots)}</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-block btn-lg"
                  disabled={!selectedSeat || isExpired}
                  onClick={handleBookNow}>
                  {isExpired ? 'Event Cancelled' : selectedSeat ? `Proceed — ${formatCurrency(selectedSeat.price * slots)}` : 'Select Category'}
                </button>
                {!selectedSeat && !isExpired && (
                  <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Please select a seat category to continue
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
