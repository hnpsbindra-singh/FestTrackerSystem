import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { extractErrorMessage } from '../../api/axios'
import {
  getMyEventDetails, getMyEventSeats, getMyEventBookings,
  declineTicket, cancelEvent
} from '../../api'
import { formatDate, formatTime, formatCurrency } from '../../utils'

export default function EventManagePage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [bookingPage, setBookingPage] = useState(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [bookingSearch, setBookingSearch] = useState('')

  const { data: event, isLoading: evLoading } = useQuery({
    queryKey: ['orgEvent', eventId],
    queryFn: () => getMyEventDetails(eventId).then(r => r.data),
  })

  const { data: seats = [] } = useQuery({
    queryKey: ['orgSeats', eventId],
    queryFn: () => getMyEventSeats(eventId).then(r => r.data),
  })

  const { data: bookingsPage, isLoading: bLoading } = useQuery({
    queryKey: ['orgBookings', eventId, bookingPage],
    queryFn: () => getMyEventBookings(eventId, bookingPage, 10).then(r => r.data),
    enabled: activeTab === 'bookings',
  })

  const declineMutation = useMutation({
    mutationFn: (bookingId) => declineTicket(eventId, bookingId),
    onSuccess: () => { toast.success('Ticket declined & seats restored'); qc.invalidateQueries(['orgBookings']) },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to decline ticket')),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelEvent(eventId),
    onSuccess: () => {
      toast.success('Event cancelled. Attendees notified.')
      qc.invalidateQueries(['myEvents'])
      navigate('/organiser')
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to cancel event')),
  })

  if (evLoading) return (
    <div style={{ paddingTop: 'var(--navbar-h)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  )

  const bookings = bookingsPage?.content || []
  const totalPages = bookingsPage?.totalPages || 0
  const totalBooked = seats.reduce((sum, s) => sum + (s.totalSeats - s.availableSeats), 0)
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalCost, 0)

  const stats = [
    { label: 'Tickets Sold', value: totalBooked },
    { label: 'Seats Remaining', value: seats.reduce((sum, s) => sum + s.availableSeats, 0) },
    { label: 'Revenue (shown)', value: formatCurrency(totalRevenue) },
    { label: 'Seating Categories', value: seats.length },
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: '#94a3b8', paddingLeft: 0, marginBottom: 12 }}
            onClick={() => navigate('/organiser')}>
            ← Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: 'white', marginBottom: 6 }}>{event?.title}</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {formatDate(event?.date)} · {formatTime(event?.time)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-dark btn-sm" onClick={() => navigate(`/organiser/event/${eventId}/scan`)}>
                📷 Scan Tickets
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowCancelModal(true)}>
                Cancel Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {stats.map(stat => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs mb-24">
          {[['overview', 'Overview'], ['seats', 'Seating'], ['bookings', 'Bookings']].map(([key, label]) => (
            <button key={key} className={`tab${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 20 }}>Event Configuration</h3>
                <div className="info-grid" style={{ marginBottom: 20 }}>
                  {[
                    { label: 'Title', value: event?.title },
                    { label: 'Genre', value: event?.genre },
                    { label: 'Language', value: event?.language },
                    { label: 'Duration', value: event?.duration },
                    { label: 'Age Limit', value: event?.ageLimit === 0 ? 'All Ages' : `${event?.ageLimit}+` },
                    { label: 'Account Holder', value: event?.accountHolderName },
                    { label: 'Bank Account', value: event?.bankAccountNumber },
                    { label: 'IFSC Code', value: event?.ifscCode },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="info-row-label">{row.label}</div>
                      <div className="info-row-value" style={{ marginTop: 3 }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                {/* Venue - full width */}
                <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div className="info-row-label">Venue Address</div>
                  <div className="info-row-value" style={{ marginTop: 4 }}>{event?.detailedAddress}</div>
                </div>
                {event?.paymentQrURL && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                    <div className="info-row-label" style={{ marginBottom: 10 }}>Payment QR Image</div>
                    <img src={event.paymentQrURL} alt="Payment QR"
                      style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seating tab */}
        {activeTab === 'seats' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {seats.map(seat => {
                const sold = seat.totalSeats - seat.availableSeats
                const pct = seat.totalSeats > 0 ? Math.round((sold / seat.totalSeats) * 100) : 0
                return (
                  <div key={seat.id} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{seat.name}</div>
                        <div className="price-tag">{formatCurrency(seat.price)}</div>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: 3, transition: 'width 0.4s ease',
                          background: pct > 80 ? 'var(--danger)' : pct > 50 ? 'var(--warning)' : 'var(--primary)',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>{sold} sold ({pct}%)</span>
                        <span>{seat.availableSeats} / {seat.totalSeats} left</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bookings tab */}
        {activeTab === 'bookings' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 16 }}>
              <input className="form-input"
                placeholder="Search by name, email, mobile, or transaction ID..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                style={{ maxWidth: 500 }}
              />
            </div>
            {bLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <div className="spinner spinner-lg" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No Bookings Yet</h3>
                <p>Submitted payments will appear here for your review.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings
                        .filter(b => {
                          if (!bookingSearch.trim()) return true
                          const q = bookingSearch.toLowerCase()
                          return (
                            (b.customerName || '').toLowerCase().includes(q) ||
                            (b.customerUsername || '').toLowerCase().includes(q) ||
                            (b.customerMobile || '').toLowerCase().includes(q) ||
                            (b.transactionId || '').toLowerCase().includes(q)
                          )
                        })
                        .map(b => (
                          <tr key={b.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerUsername}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerMobile}</div>
                            </td>
                            <td><span className="badge badge-accent">{b.seatingName}</span></td>
                            <td style={{ fontWeight: 700 }}>{b.slots}</td>
                            <td className="price-tag">{formatCurrency(b.totalCost)}</td>
                            <td>
                              <code style={{ fontSize: '0.78rem', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>
                                {b.transactionId}
                              </code>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {b.bookingDatetime ? new Date(b.bookingDatetime).toLocaleString('en-IN') : '—'}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => declineMutation.mutate(b.id)}
                                disabled={declineMutation.isPending}>
                                Decline
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" disabled={bookingPage === 0} onClick={() => setBookingPage(p => p - 1)}>← Prev</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} className={`page-btn${bookingPage === i ? ' active' : ''}`}
                        onClick={() => setBookingPage(i)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" disabled={bookingPage >= totalPages - 1} onClick={() => setBookingPage(p => p + 1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Cancel Modal ── */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Event</h3>
              <div className="modal-close" onClick={() => setShowCancelModal(false)}>✕</div>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                This cannot be undone. All registered attendees will be notified via email.
              </div>
              <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>
                Are you sure you want to cancel <strong>{event?.title}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>Keep Active</button>
                <button className="btn btn-danger" style={{ flex: 1 }}
                  onClick={() => { cancelMutation.mutate(); setShowCancelModal(false) }}
                  disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? <span className="spinner spinner-sm" /> : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
