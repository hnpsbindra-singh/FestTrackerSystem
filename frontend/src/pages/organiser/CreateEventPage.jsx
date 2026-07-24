import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { addEvent } from '../../api'
import { extractErrorMessage } from '../../api/axios'
import { INDIAN_CITIES } from '../../utils'

function FlyToLocation({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 })
  }, [lat, lng, map])
  return null
}

function MapPicker({ lat, lng, onChange }) {
  function Inner() {
    useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng) } })
    return <Marker position={[lat, lng]} />
  }
  return (
    <MapContainer center={[lat, lng]} zoom={12} style={{ height: 260, width: '100%', borderRadius: 'var(--r-lg)' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
      <FlyToLocation lat={lat} lng={lng} />
      <Inner />
    </MapContainer>
  )
}

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [lat, setLat] = useState(28.6139)
  const [lng, setLng] = useState(77.2090)
  const [locating, setLocating] = useState(false)
  const [qrFile, setQrFile] = useState(null)
  const [qrPreview, setQrPreview] = useState(null)
  const fileRef = useRef()

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setLocating(true)
    toast.loading('Detecting location...', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude); setLng(pos.coords.longitude)
        setLocating(false); toast.success('Location updated', { id: 'geo' })
      },
      (err) => {
        setLocating(false)
        toast.error(err.code === 1 ? 'Permission denied' : 'Location unavailable', { id: 'geo' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { seatingTypeRequests: [{ name: '', price: '', totalSeats: '' }] }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'seatingTypeRequests' })

  const onQrChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setQrFile(file)
    setQrPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data) => {
    if (!qrFile) { toast.error('Please upload a payment QR image'); return }
    const festData = {
      ...data,
      latitude: lat, longitude: lng,
      ageLimit: parseInt(data.ageLimit),
      seatingTypeRequests: data.seatingTypeRequests.map(s => ({
        name: s.name, price: parseFloat(s.price), totalSeats: parseInt(s.totalSeats),
      })),
    }
    try {
      await addEvent(festData, qrFile)
      toast.success('Event created successfully')
      navigate('/organiser')
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Failed to create event'))
    }
  }

  const genres = ['Music', 'Comedy', 'Tech', 'Food', 'Sports', 'Art', 'Dance', 'Film', 'Theater', 'Book', 'Wellness', 'Fashion', 'Other']

  const tabs = [
    { n: 1, label: 'Event Details' },
    { n: 2, label: 'Seating Tiers' },
    { n: 3, label: 'Payment & QR' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="container">
          <h1>Create New Event</h1>
          <p>Fill in event details, configure seating tiers, and set up payment</p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="container" style={{ maxWidth: 780, margin: '0 auto', paddingTop: 28, paddingBottom: 48 }}>
        {/* Tabs */}
        <div className="tabs mb-24">
          {tabs.map(s => (
            <button key={s.n} className={`tab${step === s.n ? ' active' : ''}`}
              type="button" onClick={() => setStep(s.n)}>
              {s.n}. {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="card animate-scaleIn">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input className={`form-input${errors.title ? ' error' : ''}`}
                    placeholder="e.g. Annual Tech Symposium 2026"
                    {...register('title', { required: 'Title is required' })} />
                  {errors.title && <span className="form-error">{errors.title.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className={`form-input${errors.description ? ' error' : ''}`} rows={4}
                    placeholder="Describe your event..."
                    {...register('description', { required: 'Description is required' })} />
                  {errors.description && <span className="form-error">{errors.description.message}</span>}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="form-input" {...register('date', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input type="time" className="form-input" {...register('time', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration *</label>
                    <input className="form-input" placeholder="e.g. 3 hours, 2 days"
                      {...register('duration', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age Limit</label>
                    <input type="number" className="form-input" placeholder="0 for all ages" min={0}
                      {...register('ageLimit', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language *</label>
                    <input className="form-input" placeholder="English, Hindi, etc."
                      {...register('language', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre *</label>
                    <select className="form-select" {...register('genre', { required: true })}>
                      <option value="">Select genre</option>
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Address *</label>
                  <input className="form-input" placeholder="Full street address, city, state"
                    {...register('detailedAddress', { required: true })} />
                </div>

                {/* Location picker */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Event Coordinates</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div className="quick-cities-scroll">
                        {INDIAN_CITIES.slice(0, 4).map(city => (
                          <button key={city.name} type="button" className="btn btn-sm btn-secondary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => { setLat(city.lat); setLng(city.lng) }}>
                            {city.name}
                          </button>
                        ))}
                      </div>
                      <select className="form-select"
                        style={{ width: 'auto', minWidth: 180, padding: '7px 28px 7px 10px', fontSize: '0.8rem' }}
                        onChange={(e) => {
                          if (!e.target.value) return
                          const [la, lo] = e.target.value.split(',').map(Number)
                          setLat(la); setLng(lo)
                        }} value="">
                        <option value="">More cities...</option>
                        {INDIAN_CITIES.map(c => (
                          <option key={c.name} value={`${c.lat},${c.lng}`}>{c.name}</option>
                        ))}
                      </select>
                      <button type="button" className="btn btn-sm btn-secondary"
                        onClick={detectLocation} disabled={locating}>
                        {locating ? 'Detecting...' : '📍 Auto-Detect'}
                      </button>
                    </div>
                  </div>
                  <MapPicker lat={lat} lng={lng} onChange={(la, lo) => { setLat(la); setLng(lo) }} />
                  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    {[
                      { label: 'Latitude', val: lat.toFixed(6) },
                      { label: 'Longitude', val: lng.toFixed(6) },
                    ].map(item => (
                      <div key={item.label} style={{ flex: 1, background: 'var(--bg-muted)', borderRadius: 'var(--r-md)', padding: '8px 12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                  Next: Seating Tiers →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="card animate-scaleIn">
              <div className="card-body">
                <h3 style={{ marginBottom: 4 }}>Seating Categories</h3>
                <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>Define ticket tiers with names, prices, and seat counts</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {fields.map((field, idx) => (
                    <div key={field.id} style={{ background: 'var(--bg-muted)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Tier {idx + 1}</div>
                        {fields.length > 1 && (
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(idx)}>Remove</button>
                        )}
                      </div>
                      <div className="tier-grid">
                        <div className="form-group">
                          <label className="form-label">Category Name</label>
                          <input className="form-input" placeholder="e.g. General Admission"
                            {...register(`seatingTypeRequests.${idx}.name`, { required: true })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Price (INR)</label>
                          <input type="number" className="form-input" placeholder="500" min={0}
                            {...register(`seatingTypeRequests.${idx}.price`, { required: true })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Total Seats</label>
                          <input type="number" className="form-input" placeholder="100" min={1}
                            {...register(`seatingTypeRequests.${idx}.totalSeats`, { required: true })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" className="btn btn-secondary btn-block" style={{ marginBottom: 20 }}
                  onClick={() => append({ name: '', price: '', totalSeats: '' })}>
                  + Add Another Tier
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(3)}>
                    Next: Payment →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card animate-scaleIn">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>Payment Information</h3>
                  <p style={{ fontSize: '0.875rem' }}>These details are shown to customers during checkout</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Holder Name *</label>
                  <input className="form-input" placeholder="Full legal name"
                    {...register('accountHolderName', { required: true })} />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Bank Account Number *</label>
                    <input className="form-input" placeholder="1234567890123"
                      {...register('bankAccountNumber', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC Code *</label>
                    <input className="form-input" placeholder="SBIN0001234"
                      {...register('ifscCode', { required: true })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment QR Image *</label>
                  <div className={`upload-zone${qrFile ? ' has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                    <input type="file" ref={fileRef} accept="image/*" onChange={onQrChange} style={{ display: 'none' }} />
                    {qrPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <img src={qrPreview} alt="QR Preview"
                          style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }} />
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
                          ✓ QR Uploaded — Click to change
                        </span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Payment QR Code</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG or JPG — Click to browse</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? <span className="spinner spinner-sm" /> : '🚀 Publish Event'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
