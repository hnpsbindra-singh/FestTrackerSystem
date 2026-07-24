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
    <div style={{ paddingTop: 'var(--navbar-h)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="spinner" />
    </div>
  )

  const bookings = bookingsPage?.content || []
  const totalPages = bookingsPage?.totalPages || 0
  const totalBooked = seats.reduce((sum, s) => sum + (s.totalSeats - s.availableSeats), 0)
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalCost, 0)

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: '#94a3b8', marginBottom: 10, paddingLeft: 0 }}
            onClick={() => navigate('/organiser')}>Back to Dashboard</button>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: 'white', marginBottom: 4 }}>{event?.title}</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Date: {formatDate(event?.date)} &bull; Time: {formatTime(event?.time)}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-secondary"
                onClick={() => navigate(`/organiser/event/${eventId}/scan`)}>
                Scan Tickets
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => setShowCancelModal(true)}>
                Cancel Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Tickets Sold', value: totalBooked },
            { label: 'Seats Remaining', value: seats.reduce((sum, s) => sum + s.availableSeats, 0) },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
            { label: 'Seating Categories', value: seats.length },
          ].map(stat => (
            <div key={stat.label} className="card">
              <div className="card-body" style={{ padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 2 }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="tabs mb-24">
          {[['overview', 'Overview'], ['seats', 'Seating Capacity'], ['bookings', 'Bookings List']].map(([key, label]) => (
            <button key={key} className={`tab${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 16 }}>Event Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Title', value: event?.title },
                    { label: 'Genre', value: event?.genre },
                    { label: 'Language', value: event?.language },
                    { label: 'Duration', value: event?.duration },
                    { label: 'Age Limit', value: event?.ageLimit === 0 ? 'All Ages' : `${event?.ageLimit}+` },
                    { label: 'Venue Address', value: event?.detailedAddress },
                    { label: 'Bank Account Number', value: event?.bankAccountNumber },
                    { label: 'IFSC Code', value: event?.ifscCode },
                    { label: 'Account Holder', value: event?.accountHolderName },
                  ].map(row => (
                    <div key={row.label} style={{ gridColumn: row.label === 'Venue Address' ? 'span 2' : 'auto' }}>
                      <div className="info-row-label">{row.label}</div>
                      <div className="info-row-value">{row.value}</div>
                    </div>
                  ))}
                </div>
                {event?.paymentQrURL && (
                  <div style={{ marginTop: 20 }}>
                    <div className="info-row-label" style={{ marginBottom: 6 }}>Payment QR Image</div>
                    <img src={event.paymentQrURL} alt="Payment QR" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seats' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {seats.map(seat => {
                const sold = seat.totalSeats - seat.availableSeats
                const pct = seat.totalSeats > 0 ? Math.round((sold / seat.totalSeats) * 100) : 0
                return (
                  <div key={seat.id} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{seat.name}</div>
                        <div className="price-tag">{formatCurrency(seat.price)}</div>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? 'var(--danger)' : pct > 50 ? 'var(--warning)' : 'var(--primary)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>{sold} sold ({pct}%)</span>
                        <span>{seat.availableSeats} available / {seat.totalSeats} total</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 16 }}>
              <input
                className="form-input"
                placeholder="Search bookings by customer name, email, mobile, or transaction ID..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                style={{ maxWidth: 480 }}
              />
            </div>
            {bLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <h3>No Bookings Submitted</h3>
                <p>Submitted payments for verification will appear in this list.</p>
              </div>
            ) : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Category</th>
                        <th>Tickets</th>
                        <th>Amount</th>
                        <th>Transaction ID</th>
                        <th>Booking Time</th>
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
                          <td><code style={{ fontSize: '0.8rem', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>{b.transactionId}</code></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {b.bookingDatetime ? new Date(b.bookingDatetime).toLocaleString('en-IN') : '-'}
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
                    <button className="page-btn" disabled={bookingPage === 0} onClick={() => setBookingPage(p => p - 1)}>Prev</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} className={`page-btn${bookingPage === i ? ' active' : ''}`} onClick={() => setBookingPage(i)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" disabled={bookingPage >= totalPages - 1} onClick={() => setBookingPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Event</h3>
              <div className="modal-close" onClick={() => setShowCancelModal(false)}>✕</div>
            </div>
            <div className="modal-body">
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16 }}>
                <p style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.875rem' }}>
                  This operation cannot be undone. An email broadcast will be dispatched to all registered attendees.
                </p>
              </div>
              <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Are you sure you want to cancel <strong>{event?.title}</strong>?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>Keep Active</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { cancelMutation.mutate(); setShowCancelModal(false) }}
                  disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? <span className="spinner spinner-sm" /> : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
