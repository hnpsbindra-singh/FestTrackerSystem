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
      if (diff <= 0) { setTimeLeft('Event Active / Ended'); return }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      if (days > 0) setTimeLeft(`${days}d ${hours}h away`)
      else setTimeLeft(`${hours}h ${minutes}m away`)
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [dateStr, timeStr])

  if (!timeLeft) return null
  return <span className="badge badge-accent">{timeLeft}</span>
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
    } catch { return [] }
  }

  const liveBookings = data?.content || []
  const offlineBookings = getOfflineTickets()
  const isOffline = isError || (!isLoading && liveBookings.length === 0 && offlineBookings.length > 0)
  const bookings = liveBookings.length > 0 ? liveBookings : offlineBookings
  const totalPages = data?.totalPages || 0

  const handlePrint = (e) => { e.stopPropagation(); window.print() }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>My Tickets</h1>
            <p>Your reservations and check-in QR codes</p>
          </div>
          {isOffline && (
            <span className="badge badge-warning" style={{ fontSize: '0.78rem' }}>
              Offline — Cached Tickets
            </span>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--r-xl)' }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && bookings.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎟️</div>
            <h3>No Tickets Yet</h3>
            <p>You haven't reserved any event tickets yet.</p>
            <a href="/app" className="btn btn-primary mt-16">Browse Events</a>
          </div>
        )}

        {/* Ticket list */}
        {!isLoading && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map(booking => {
              const { label, cls } = paymentStatusLabel(booking.paymentStatus)
              const isExpanded = expanded === booking.id
              const isConfirmed = booking.paymentStatus === 'PAYMENT_SUBMITTED'

              return (
                <div key={booking.id} className="card animate-fadeIn"
                  style={{ cursor: 'pointer', overflow: 'visible' }}
                  onClick={() => setExpanded(isExpanded ? null : booking.id)}>
                  <div className="card-body">
                    {/* Summary row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {/* Title + meta */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
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
                      {/* Amount + status */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="price-tag" style={{ fontSize: '1.1rem', marginBottom: 6 }}>{formatCurrency(booking.totalCost)}</div>
                        <span className={cls}>{label}</span>
                      </div>
                      {/* Expand caret */}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>

                    {/* Expanded ticket pass */}
                    {isExpanded && (
                      <>
                        <div className="ticket-tear-line" style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }} className="animate-slideUp">
                          {/* QR or pending */}
                          <div style={{ flex: '0 0 auto', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            {isConfirmed && booking.bookingKey ? (
                              <>
                                <QRCodeSVG
                                  value={booking.bookingKey}
                                  size={140}
                                  fgColor="#0f172a"
                                  style={{ borderRadius: 'var(--r-lg)', padding: 10, background: 'white', border: '1px solid var(--border)' }}
                                />
                                <div className="booking-key" style={{ maxWidth: 200, width: '100%' }}>
                                  {booking.bookingKey}
                                </div>
                                <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 200 }}>
                                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigator.clipboard.writeText(booking.bookingKey)
                                      toast.success('Ticket code copied')
                                    }}>Copy</button>
                                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}
                                    onClick={handlePrint}>Print</button>
                                </div>
                              </>
                            ) : (
                              <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: '20px 24px', border: '1px solid var(--border)', textAlign: 'center', maxWidth: 220 }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>
                                  {booking.paymentStatus === 'PAYMENT_REJECTED' ? '❌' : '⏳'}
                                </div>
                                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                                  {booking.paymentStatus === 'PAYMENT_REJECTED'
                                    ? 'Payment was rejected by organiser.'
                                    : 'Awaiting organiser verification.'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Booking details */}
                          <div style={{ flex: 1, minWidth: 200 }}>
                            {[
                              { label: 'Venue', value: booking.detailedAddress },
                              { label: 'Tickets', value: `${booking.slots} ticket${booking.slots > 1 ? 's' : ''}` },
                              { label: 'Check-in Status', value: booking.checkedIn ? '✅ Checked In' : 'Not Checked In' },
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
                      </>
                    )}
                  </div>
                </div>
              )
            })}
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
