import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { initiateBooking, confirmBooking } from '../../api'
import { extractErrorMessage } from '../../api/axios'
import { formatCurrency } from '../../utils'

export default function CheckoutPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  if (!state) {
    navigate('/app')
    return null
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const { festId, seatingTypeId, seatingName, slots, totalCost, festTitle } = state

  const handleInitiate = async () => {
    setIsLoading(true)
    try {
      const res = await initiateBooking({ festId, seatingTypeId, slots })
      setBookingData(res.data)
      setStep(2)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Failed to initiate booking'))
    } finally {
      setIsLoading(false)
    }
  }

  const onConfirm = async (data) => {
    setIsLoading(true)
    try {
      await confirmBooking(bookingData.bookingId, { transactionId: data.transactionId })
      toast.success('Booking request submitted successfully')
      setStep(4)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Confirmation failed. Seats may be sold out.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container-sm" style={{ padding: '32px 20px' }}>
        <div className="steps mb-24">
          {[
            { n: 1, label: 'Review' },
            { n: 2, label: 'Payment' },
            { n: 3, label: 'Confirm' },
            { n: 4, label: 'Complete' },
          ].map((s, idx, arr) => (
            <React.Fragment key={s.n}>
              <div className="step">
                <div className={`step-num${step === s.n ? ' active' : step > s.n ? ' done' : ' pending'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="step-label hide-mobile">{s.label}</span>
              </div>
              {idx < arr.length - 1 && <div className={`step-line${step > s.n ? ' done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 20 }}>Order Summary</h2>
              <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20, border: '1px solid var(--border)' }}>
                <div className="info-row">
                  <div className="info-row-content">
                    <div className="info-row-label">Event</div>
                    <div className="info-row-value" style={{ fontWeight: 700 }}>{festTitle}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-row-content">
                    <div className="info-row-label">Category</div>
                    <div className="info-row-value">{seatingName}</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-row-content">
                    <div className="info-row-label">Quantity</div>
                    <div className="info-row-value">{slots} ticket{slots > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Amount</span>
                <span className="price-tag" style={{ fontSize: '1.5rem' }}>{formatCurrency(totalCost)}</span>
              </div>
              <div style={{ background: '#fffbe8', border: '1px solid #fef08a', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 20, fontSize: '0.825rem', color: '#854d0e' }}>
                Note: Seats will be finalized after payment transaction verification.
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handleInitiate} disabled={isLoading}>
                {isLoading ? <span className="spinner spinner-sm" /> : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && bookingData && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 4 }}>Payment Details</h2>
              <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>Please transfer <strong>{formatCurrency(bookingData.totalCost)}</strong> using the details below</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: 12, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Bank Account Details</h4>
                  {[
                    { label: 'Account Name', value: bookingData.accountHolderName },
                    { label: 'Account Number', value: bookingData.bankAccountNumber },
                    { label: 'IFSC Code', value: bookingData.ifscCode },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{row.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem', userSelect: 'all' }}>{row.value}</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => copyToClipboard(row.value, row.label)}
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>UPI / QR Code</h4>
                  <img src={bookingData.paymentQrURL} alt="Payment QR" style={{ width: 130, height: 130, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>Scan via your preferred payment app</p>
                </div>
              </div>

              <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 20, fontSize: '0.825rem', color: '#3730a3' }}>
                Save your <strong>Transaction ID / Ref Number</strong> after making payment.
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={() => setStep(3)}>
                Enter Transaction Reference
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 4 }}>Confirm Transaction</h2>
              <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>Enter the payment reference or UTR number provided by your payment provider</p>
              <form onSubmit={handleSubmit(onConfirm)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Transaction ID / UTR Number</label>
                  <input className={`form-input${errors.transactionId ? ' error' : ''}`}
                    placeholder="e.g. 312456789123 or T2406XXXX"
                    {...register('transactionId', { required: 'Transaction ID is required', minLength: { value: 6, message: 'Enter a valid transaction ID' } })} />
                  {errors.transactionId && <span className="form-error">{errors.transactionId.message}</span>}
                </div>
                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 12, fontSize: '0.825rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Booking Ref</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{bookingData?.bookingId?.slice(0, 16)}...</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                    <span className="price-tag">{formatCurrency(bookingData?.totalCost || totalCost)}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={isLoading}>
                  {isLoading ? <span className="spinner spinner-sm" /> : 'Submit Confirmation'}
                </button>
                <button type="button" className="btn btn-ghost btn-block" onClick={() => setStep(2)}>Back to Payment Details</button>
              </form>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card animate-scaleIn">
            <div style={{ background: '#0f172a', padding: '36px 20px', textAlign: 'center', color: 'white' }}>
              <h2 style={{ color: 'white', marginBottom: 6 }}>Booking Request Submitted</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Your transaction reference is pending verification by the event organiser.</p>
            </div>
            <div className="card-body text-center">
              <p style={{ marginBottom: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Once verified, your ticket key and QR code will be activated under <strong>My Tickets</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/app/bookings')}>View My Tickets</button>
                <button className="btn btn-secondary" onClick={() => navigate('/app')}>Browse Events</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
