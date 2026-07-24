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
    <MapContainer center={[lat, lng]} zoom={12} style={{ height: 280, width: '100%', borderRadius: 'var(--radius-md)' }}>
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
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    toast.loading('Detecting coordinates...', { id: 'geo' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLat(latitude)
        setLng(longitude)
        setLocating(false)
        toast.success('Location coordinates updated', { id: 'geo' })
      },
      (err) => {
        setLocating(false)
        const msg = err.code === 1
          ? 'Location permission denied. Please allow access.'
          : 'Unable to detect location. Try again.'
        toast.error(msg, { id: 'geo' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      seatingTypeRequests: [{ name: '', price: '', totalSeats: '' }],
    }
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
      latitude: lat,
      longitude: lng,
      ageLimit: parseInt(data.ageLimit),
      seatingTypeRequests: data.seatingTypeRequests.map(s => ({
        name: s.name,
        price: parseFloat(s.price),
        totalSeats: parseInt(s.totalSeats),
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

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-hero">
        <div className="container">
          <h1>Create New Event</h1>
          <p>Provide details, location coordinates, seating tiers, and payment configuration</p>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 20px', maxWidth: 760, margin: '0 auto' }}>
        <div className="tabs mb-24">
          {[
            { n: 1, label: '1. Event Details' },
            { n: 2, label: '2. Seating Tiers' },
            { n: 3, label: '3. Payment & QR' },
          ].map(s => (
            <button key={s.n} className={`tab${step === s.n ? ' active' : ''}`}
              onClick={() => setStep(s.n)}>{s.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="card animate-scaleIn">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input className={`form-input${errors.title ? ' error' : ''}`} placeholder="e.g. Annual Tech Symposium 2026"
                    {...register('title', { required: 'Title is required' })} />
                  {errors.title && <span className="form-error">{errors.title.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className={`form-input${errors.description ? ' error' : ''}`} rows={4}
                    placeholder="Provide a comprehensive summary of the event..."
                    {...register('description', { required: 'Description is required' })} />
                  {errors.description && <span className="form-error">{errors.description.message}</span>}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Date</label>
                    <input type="date" className="form-input" {...register('date', { required: 'Date is required' })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Time</label>
                    <input type="time" className="form-input" {...register('time', { required: 'Time is required' })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input className="form-input" placeholder="e.g. 3 hours, 2 days"
                      {...register('duration', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age Limit</label>
                    <input type="number" className="form-input" placeholder="0 for all ages" min={0}
                      {...register('ageLimit', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <input className="form-input" placeholder="English, Hindi, etc."
                      {...register('language', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre Category</label>
                    <select className="form-select" {...register('genre', { required: true })}>
                      <option value="">Select genre</option>
                      {genres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Address</label>
                  <input className="form-input" placeholder="Full street address, city, state"
                    {...register('detailedAddress', { required: true })} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>Event Location Coordinates</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={detectLocation}
                        disabled={locating}
                      >
                        {locating ? 'Detecting...' : 'Auto-Detect Location'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quick Cities:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {INDIAN_CITIES.slice(0, 4).map(city => (
                        <button
                          key={city.name}
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                          onClick={() => {
                            setLat(city.lat)
                            setLng(city.lng)
                          }}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                    <select
                      className="form-select"
                      style={{ width: 'auto', minWidth: 190, padding: '3px 26px 3px 8px', fontSize: '0.8rem' }}
                      onChange={(e) => {
                        if (!e.target.value) return
                        const [la, lo] = e.target.value.split(',').map(Number)
                        setLat(la)
                        setLng(lo)
                      }}
                      value=""
                    >
                      <option value="">Select City (40+ Cities)...</option>
                      {INDIAN_CITIES.map(c => (
                        <option key={c.name} value={`${c.lat},${c.lng}`}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <MapPicker lat={lat} lng={lng} onChange={(la, lo) => { setLat(la); setLng(lo) }} />
                  <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: '8px 12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Latitude</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{lat.toFixed(6)}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: '8px 12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Longitude</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{lng.toFixed(6)}</div>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-primary btn-lg mt-8" onClick={() => setStep(2)}>
                  Next: Seating Tiers
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card animate-scaleIn">
              <div className="card-body">
                <h3 style={{ marginBottom: 4 }}>Seating Categories</h3>
                <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>Define seating types, capacity, and pricing per ticket</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {fields.map((field, idx) => (
                    <div key={field.id} style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Tier {idx + 1}</div>
                        {fields.length > 1 && (
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(idx)}>Remove</button>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">Category Name</label>
                          <input className="form-input" placeholder="General Admission"
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
                  Add Another Tier
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                  <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(3)}>
                    Next: Payment & QR
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card animate-scaleIn">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ marginBottom: 0 }}>Payment Information</h3>
                <p style={{ marginTop: -4, fontSize: '0.875rem' }}>Direct bank and UPI details displayed to customers during ticket reservation</p>
                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input className="form-input" placeholder="Full legal name"
                    {...register('accountHolderName', { required: true })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Bank Account Number</label>
                    <input className="form-input" placeholder="1234567890123"
                      {...register('bankAccountNumber', { required: true })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input className="form-input" placeholder="SBIN0001234"
                      {...register('ifscCode', { required: true })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment QR Image</label>
                  <div className={`upload-zone${qrFile ? ' has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                    <input type="file" ref={fileRef} accept="image/*" onChange={onQrChange} style={{ display: 'none' }} />
                    {qrPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <img src={qrPreview} alt="QR Preview" style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>QR Uploaded — Click to change</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Upload Payment QR Code</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supported formats: PNG, JPG</div>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? <span className="spinner spinner-sm" /> : 'Publish Event'}
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
