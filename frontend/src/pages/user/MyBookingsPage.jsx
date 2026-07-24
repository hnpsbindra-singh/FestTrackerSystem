import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { getMyBookings } from '../../api'
import { formatDate, formatTime, formatCurrency, paymentStatusLabel } from '../../utils'

function EventCountdown({ dateStr, timeStr }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!dateStr) return
    const update = () => {
      const target = new Date(`${dateStr}T${timeStr || '00:00:00'}`).getTime()
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('Event Active / Ended')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) setTimeLeft(`Starts in ${days}d ${hours}h`)
      else setTimeLeft(`Starts in ${hours}h ${minutes}m`)
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [dateStr, timeStr])

  if (!timeLeft) return null
  return (
    <span className="badge badge-accent">
      {timeLeft}
    </span>
  )
}

export default function MyBookingsPage() {
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myBookings', page],
    queryFn: () => getMyBookings(page, 10).then(r => r.data),
  })

  useEffect(() => {
    if (data?.content && data.content.length > 0) {
      try {
        localStorage.setItem('fest_offline_tickets', JSON.stringify(data.content))
      } catch (e) {}
    }
  }, [data])

  const getOfflineTickets = () => {
    try {
      const cached = localStorage.getItem('fest_offline_tickets')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  }

  const liveBookings = data?.content || []
  const offlineBookings = getOfflineTickets()
  const isOffline = isError || (!isLoading && liveBookings.length === 0 && offlineBookings.length > 0)
  const bookings = liveBookings.length > 0 ? liveBookings : offlineBookings
  const totalPages = data?.totalPages || 0

  const handlePrint = (e) => {
    e.stopPropagation()
    window.print()
  }

  return (
    <div>
      <div className="page-hero">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>My Tickets</h1>
            <p>Manage your reservations and access venue check-in codes</p>
          </div>
          {isOffline && (
            <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              Offline Mode — Showing Cached Tickets
            </span>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 84, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {!isLoading && bookings.length === 0 && (
          <div className="empty-state">
            <h3>No Bookings Found</h3>
            <p>You haven't reserved any event tickets yet.</p>
            <a href="/app" className="btn btn-primary mt-16">Browse Events</a>
          </div>
        )}

        {!isLoading && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(booking => {
              const { label, cls } = paymentStatusLabel(booking.paymentStatus)
              const isExpanded = expanded === booking.id
              const isConfirmed = booking.paymentStatus === 'PAYMENT_SUBMITTED'

              return (
                <div key={booking.id} className="card animate-fadeIn"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpanded(isExpanded ? null : booking.id)}>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            {booking.festTitle}
                          </span>
                          <EventCountdown dateStr={booking.festDate} timeStr={booking.festTime} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className="badge badge-muted">{formatDate(booking.festDate)}</span>
                          <span className="badge badge-muted">{formatTime(booking.festTime)}</span>
                          <span className="badge badge-accent">{booking.seatingName}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="price-tag" style={{ fontSize: '1.15rem', marginBottom: 4 }}>{formatCurrency(booking.totalCost)}</div>
                        <span className={cls}>{label}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, flexWrap: 'wrap' }} className="animate-slideUp">
                        {isConfirmed && booking.bookingKey ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <QRCodeSVG
                              value={booking.bookingKey}
                              size={140}
                              fgColor="#0f172a"
                              style={{ borderRadius: 'var(--radius-md)', padding: 8, background: 'white', border: '1px solid var(--border)' }}
                            />
                            <div className="booking-key" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontSize: '0.95rem' }}>{booking.bookingKey}</span>
                              <button
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '0.75rem', background: '#ffffff' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(booking.bookingKey)
                                  toast.success('Ticket code copied')
                                }}
                              >
                                Copy
                              </button>
                            </div>
                            <button className="btn btn-sm btn-secondary" onClick={handlePrint} style={{ width: '100%' }}>
                              Print / Download Pass
                            </button>
                          </div>
                        ) : (
                          <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.825rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              {booking.paymentStatus === 'PAYMENT_REJECTED'
                                ? 'Payment was not approved by organiser.'
                                : 'Pending organiser verification.'}
                            </p>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          {[
                            { label: 'Venue Address', value: booking.detailedAddress },
                            { label: 'Ticket Quantity', value: `${booking.slots}` },
                            { label: 'Check-in Status', value: booking.checkedIn ? 'Checked In' : 'Not Checked In' },
                          ].map(row => (
                            <div key={row.label} className="info-row">
                              <div className="info-row-content">
                                <div className="info-row-label">{row.label}</div>
                                <div className="info-row-value">{row.value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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
