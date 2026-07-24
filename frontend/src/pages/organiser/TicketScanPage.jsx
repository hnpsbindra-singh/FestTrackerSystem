import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import toast from 'react-hot-toast'
import { verifyTicket } from '../../api'
import { extractErrorMessage } from '../../api/axios'

export default function TicketScanPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState('camera')
  const [manualKey, setManualKey] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const scannerRef = useRef(null)

  const playScanFeedback = (success) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch (e) {}

    if (navigator.vibrate) {
      if (success) navigator.vibrate(100)
      else navigator.vibrate([100, 50, 100])
    }
  }

  const verify = async (key) => {
    if (!key.trim() || isVerifying) return
    setIsVerifying(true)
    try {
      await verifyTicket(eventId, key.trim())
      setLastResult({ success: true, key: key.trim() })
      playScanFeedback(true)
      toast.success('Ticket verified. Entry granted.')
    } catch (e) {
      setLastResult({ success: false, key: key.trim() })
      playScanFeedback(false)
      toast.error(extractErrorMessage(e, 'Invalid or already used ticket'))
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (mode !== 'camera') return
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    )
    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        verify(decodedText)
        setMode('result')
      },
      () => {}
    )
    scannerRef.current = scanner
    return () => {
      scanner.clear().catch(() => {})
    }
  }, [mode])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="page-hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Ticket Scanner</h1>
            <p>Scan entry QR codes or enter booking key manually for venue check-in</p>
          </div>
          <button className="btn btn-sm btn-secondary" style={{ background: 'transparent', color: '#94a3b8', borderColor: '#334155' }}
            onClick={() => navigate(`/organiser/event/${eventId}`)}>
            Back to Event
          </button>
        </div>
      </div>

      <div className="container-sm" style={{ padding: '28px 20px' }}>
        <div className="tabs mb-24">
          <button className={`tab${mode === 'camera' || mode === 'result' ? ' active' : ''}`}
            onClick={() => setMode('camera')}>Camera Scanner</button>
          <button className={`tab${mode === 'manual' ? ' active' : ''}`}
            onClick={() => setMode('manual')}>Manual Key Entry</button>
        </div>

        {(mode === 'camera') && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <div style={{ background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 14, border: '1px solid var(--border)' }}>
                <div id="qr-reader" />
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Align the attendee's ticket QR code within the camera frame
              </p>
            </div>
          </div>
        )}

        {mode === 'result' && lastResult && (
          <div className="card animate-scaleIn">
            <div style={{
              padding: '36px 20px', textAlign: 'center',
              background: lastResult.success ? '#15803d' : '#b91c1c',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: 4 }}>{lastResult.success ? 'Entry Granted' : 'Verification Failed'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>
                {lastResult.success ? 'Ticket valid and checked in.' : 'Ticket is invalid or already checked in.'}
              </p>
            </div>
            <div className="card-body text-center">
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Key: {lastResult.key}
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={() => setMode('camera')}>
                Scan Next Ticket
              </button>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="card animate-scaleIn">
            <div className="card-body">
              <h3 style={{ marginBottom: 4 }}>Manual Ticket Check-in</h3>
              <p style={{ marginBottom: 16, fontSize: '0.875rem' }}>Input the 16-character alphanumeric booking key</p>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Booking Key</label>
                <input className="form-input" placeholder="e.g. AB12CD34EF56GH78"
                  value={manualKey} onChange={e => setManualKey(e.target.value.toUpperCase())}
                  style={{ letterSpacing: '0.1em', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700 }}
                  onKeyDown={e => e.key === 'Enter' && verify(manualKey)} />
              </div>
              <button className="btn btn-primary btn-block btn-lg"
                onClick={() => verify(manualKey)} disabled={!manualKey.trim() || isVerifying}>
                {isVerifying ? <span className="spinner spinner-sm" /> : 'Verify Ticket Code'}
              </button>

              {lastResult && (
                <div style={{
                  marginTop: 16, padding: 14, borderRadius: 'var(--radius-md)',
                  background: lastResult.success ? '#dcfce7' : '#fee2e2',
                  border: `1px solid ${lastResult.success ? '#86efac' : '#fca5a5'}`,
                  textAlign: 'center',
                }} className="animate-slideUp">
                  <div style={{ fontWeight: 700, color: lastResult.success ? '#15803d' : '#b91c1c', fontSize: '0.9rem' }}>
                    {lastResult.success ? 'Ticket Verified — Entry Granted' : 'Invalid or Already Checked In'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
