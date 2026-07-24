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
    toast.success(`${label} copied`)
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
    } finally { setIsLoading(false) }
  }

  const onConfirm = async (data) => {
    setIsLoading(true)
    try {
      await confirmBooking(bookingData.bookingId, { transactionId: data.transactionId })
      toast.success('Booking submitted successfully')
      setStep(4)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Confirmation failed. Seats may be sold out.'))
    } finally { setIsLoading(false) }
  }

  const steps = [
    { n: 1, label: 'Review' },
    { n: 2, label: 'Pay' },
    { n: 3, label: 'Confirm' },
    { n: 4, label: 'Done' },
  ]

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container-sm" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Step indicator */}
        <div className="steps mb-24">
          {steps.map((s, idx) => (
            <React.Fragment key={s.n}>
              <div className="step">
                <div className={`step-num${step === s.n ? ' active' : step > s.n ? ' done' : ' pending'}`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="step-label hide-mobile">{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`step-line${step > s.n ? ' done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Review */}
        {step === 1 && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 20 }}>Order Summary</h2>

              <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 18, marginBottom: 20, border: '1px solid var(--border)' }}>
                {[
                  { label: 'Event', value: festTitle },
                  { label: 'Category', value: seatingName },
                  { label: 'Quantity', value: `${slots} ticket${slots > 1 ? 's' : ''}` },
                ].map(row => (
                  <div key={row.label} className="info-row">
                    <div className="info-row-content">
                      <div className="info-row-label">{row.label}</div>
                      <div className="info-row-value" style={{ fontWeight: row.label === 'Event' ? 700 : 500 }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total Amount</span>
                <span className="price-tag" style={{ fontSize: '1.5rem' }}>{formatCurrency(totalCost)}</span>
              </div>

              <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                Seats will be confirmed after your payment is verified by the organiser.
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={handleInitiate} disabled={isLoading}>
                {isLoading ? <span className="spinner spinner-sm" /> : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && bookingData && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 6 }}>Payment Details</h2>
              <p style={{ marginBottom: 24, fontSize: '0.9rem' }}>
                Transfer <strong>{formatCurrency(bookingData.totalCost)}</strong> using the details below, then proceed to enter your reference number.
              </p>

              <div className="checkout-grid" style={{ marginBottom: 20 }}>
                {/* Bank account */}
                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em', marginBottom: 14 }}>
                    Bank Account Details
                  </div>
                  {[
                    { label: 'Account Name', value: bookingData.accountHolderName },
                    { label: 'Account Number', value: bookingData.bankAccountNumber },
                    { label: 'IFSC Code', value: bookingData.ifscCode },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{row.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.875rem', userSelect: 'all', wordBreak: 'break-all' }}>{row.value}</div>
                        <button type="button" className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.72rem', flexShrink: 0 }}
                          onClick={() => copyToClipboard(row.value, row.label)}>
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>UPI / QR Code</div>
                  <img src={bookingData.paymentQrURL} alt="Payment QR"
                    style={{ width: 140, height: 140, borderRadius: 'var(--r-md)', objectFit: 'cover', border: '1px solid var(--border)', background: 'white' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Scan via any payment app</p>
                </div>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                Save your <strong>Transaction ID / UTR Number</strong> after payment — you'll need it in the next step.
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={() => setStep(3)}>
                I've Paid — Enter Reference →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h2 style={{ marginBottom: 6 }}>Confirm Payment</h2>
              <p style={{ marginBottom: 24, fontSize: '0.875rem' }}>
                Enter your transaction or UTR reference number to complete your booking.
              </p>
              <form onSubmit={handleSubmit(onConfirm)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Transaction ID / UTR Number</label>
                  <input className={`form-input${errors.transactionId ? ' error' : ''}`}
                    placeholder="e.g. 312456789123 or T2406XXXX"
                    {...register('transactionId', { required: 'Required', minLength: { value: 6, message: 'Enter a valid ID' } })} />
                  {errors.transactionId && <span className="form-error">{errors.transactionId.message}</span>}
                </div>

                <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Booking Ref</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.825rem' }}>
                      {bookingData?.bookingId?.slice(0, 16)}...
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>Amount</span>
                    <span className="price-tag">{formatCurrency(bookingData?.totalCost || totalCost)}</span>
                  </div>
                </div>

                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={isLoading}>
                  {isLoading ? <span className="spinner spinner-sm" /> : 'Submit Booking'}
                </button>
                <button type="button" className="btn btn-ghost btn-block" onClick={() => setStep(2)}>
                  ← Back to Payment
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="card animate-scaleIn">
            <div style={{ background: 'var(--grad-dark)', padding: '40px 24px', textAlign: 'center', color: 'white' }}>
              <h2 style={{ color: 'white', marginBottom: 8 }}>Booking Submitted!</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Your transaction is pending verification by the event organiser.
              </p>
            </div>
            <div className="card-body text-center">
              <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Once verified, your ticket and QR code will appear under <strong>My Tickets</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/app/bookings')}>View My Tickets</button>
                <button className="btn btn-secondary" onClick={() => navigate('/app')}>Browse More Events</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
