import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { register as registerApi, verifyOtp, login, sendOtp, resetPassword } from '../api'
import { extractErrorMessage } from '../api/axios'
import { useAuthStore } from '../store/authStore'

const TABS = { login: 'Sign In', register: 'Create Account', forgot: 'Reset Password' }

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const navigate = useNavigate()
  const { setAuth, role } = useAuthStore()

  React.useEffect(() => {
    if (role === 'USER') navigate('/app')
    if (role === 'ORGANISER') navigate('/organiser')
  }, [role, navigate])

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-heading)', fontSize: 'clamp(4rem, 15vw, 12rem)', fontWeight: 900,
        color: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap', userSelect: 'none',
        pointerEvents: 'none', letterSpacing: '-0.04em', zIndex: 0,
      }}>
        FestTracker
      </div>

      <div style={{ width: '100%', maxWidth: 440, zIndex: 1 }} className="animate-scaleIn">
        <div className="text-center mb-24">
          <div style={{
            fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800,
            color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 4,
          }}>
            FestTracker
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Event &amp; Ticket Management</p>
        </div>

        <div className="card" style={{ border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div className="card-body">
            <div className="tabs mb-24">
              {Object.entries(TABS).map(([key, label]) => (
                <button key={key} className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
                  {label}
                </button>
              ))}
            </div>

            {tab === 'login'    && <LoginForm setAuth={setAuth} navigate={navigate} />}
            {tab === 'register' && <RegisterForm onSuccess={() => setTab('login')} />}
            {tab === 'forgot'   && <ForgotForm onSuccess={() => setTab('login')} />}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: '#334155' }}>
          Secured with end-to-end encryption
        </p>
      </div>
    </div>
  )
}

function LoginForm({ setAuth, navigate }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      const token = res.data
      setAuth(token)
      const { role } = useAuthStore.getState()
      toast.success('Welcome back!')
      if (role === 'ORGANISER') navigate('/organiser')
      else navigate('/app')
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Invalid credentials'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className={`form-input${errors.username ? ' error' : ''}`}
          type="email" placeholder="name@company.com"
          {...register('username', { required: 'Email is required' })} />
        {errors.username && <span className="form-error">{errors.username.message}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input className={`form-input${errors.password ? ' error' : ''}`}
          type="password" placeholder="Enter your password"
          {...register('password', { required: 'Password is required' })} />
        {errors.password && <span className="form-error">{errors.password.message}</span>}
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={isSubmitting} style={{ marginTop: 4 }}>
        {isSubmitting ? <span className="spinner spinner-sm" /> : 'Sign In →'}
      </button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [pendingUsername, setPendingUsername] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'USER' }
  })
  const { register: reg2, handleSubmit: hs2, formState: { isSubmitting: isS2 } } = useForm()

  const onRegister = async (data) => {
    try {
      await registerApi(data)
      setPendingUsername(data.username)
      toast.success('Verification code sent to your email')
      setStep(2)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Registration failed'))
    }
  }

  const onVerify = async (data) => {
    try {
      await verifyOtp({ username: pendingUsername, otp: data.otp })
      toast.success('Account verified! Please sign in.')
      onSuccess()
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Invalid OTP'))
    }
  }

  if (step === 2) return (
    <form onSubmit={hs2(onVerify)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="text-center" style={{ padding: '8px 0 16px' }}>
        <h3 style={{ color: 'white', marginBottom: 6 }}>Check your inbox</h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Enter the 6-digit code sent to <strong style={{ color: '#94a3b8' }}>{pendingUsername}</strong>
        </p>
      </div>
      <div className="form-group">
        <label className="form-label">Verification Code</label>
        <input className="form-input" type="text" maxLength={6} placeholder="123456"
          style={{ letterSpacing: '0.4em', textAlign: 'center', fontSize: '1.35rem', fontWeight: 800 }}
          {...reg2('otp', { required: true })} />
      </div>
      <button className="btn btn-primary btn-block btn-lg" disabled={isS2}>
        {isS2 ? <span className="spinner spinner-sm" /> : 'Verify Account'}
      </button>
      <button type="button" className="btn btn-ghost btn-block" onClick={() => setStep(1)}>← Back</button>
    </form>
  )

  return (
    <form onSubmit={handleSubmit(onRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Account Type</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['USER', 'ORGANISER'].map(r => (
            <label key={r} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 14px',
              border: `1.5px solid ${watch('role') === r ? '#6366f1' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)', flex: 1, justifyContent: 'center', fontWeight: 600,
              fontSize: '0.875rem', color: watch('role') === r ? 'var(--primary-dark)' : 'var(--text-secondary)',
              background: watch('role') === r ? 'var(--primary-glass)' : 'transparent',
              transition: 'all var(--transition)',
            }}>
              <input type="radio" value={r} {...register('role')} style={{ display: 'none' }} />
              {r === 'USER' ? 'Attendee' : 'Organiser'}
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className={`form-input${errors.name ? ' error' : ''}`} placeholder="John Doe"
          {...register('name', { required: 'Name is required' })} />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className={`form-input${errors.username ? ' error' : ''}`}
          type="email" placeholder="name@company.com"
          {...register('username', { required: 'Email is required' })} />
        {errors.username && <span className="form-error">{errors.username.message}</span>}
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className={`form-input${errors.password ? ' error' : ''}`}
            type="password" placeholder="Min 8 chars"
            {...register('password', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })} />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Mobile Number</label>
          <input className={`form-input${errors.mobile ? ' error' : ''}`} placeholder="9876543210"
            {...register('mobile', { required: 'Mobile required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
          {errors.mobile && <span className="form-error">{errors.mobile.message}</span>}
        </div>
      </div>
      <button className="btn btn-primary btn-block btn-lg mt-8" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <span className="spinner spinner-sm" /> : 'Send Verification Code →'}
      </button>
    </form>
  )
}

function ForgotForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [pendingUsername, setPendingUsername] = useState('')
  const { register: r1, handleSubmit: hs1, formState: { isSubmitting: s1 } } = useForm()
  const { register: r2, handleSubmit: hs2, formState: { isSubmitting: s2 } } = useForm()

  const onSend = async (data) => {
    try {
      await sendOtp(data.username)
      setPendingUsername(data.username)
      toast.success('Reset code sent')
      setStep(2)
    } catch (e) {
      toast.error(extractErrorMessage(e, 'User not found'))
    }
  }

  const onReset = async (data) => {
    try {
      await resetPassword({ username: pendingUsername, otp: data.otp, newPassword: data.newPassword })
      toast.success('Password updated. Please sign in.')
      onSuccess()
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Invalid OTP'))
    }
  }

  if (step === 2) return (
    <form onSubmit={hs2(onReset)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Verification Code</label>
        <input className="form-input" type="text" maxLength={6} placeholder="123456"
          style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
          {...r2('otp', { required: true })} />
      </div>
      <div className="form-group">
        <label className="form-label">New Password</label>
        <input className="form-input" type="password" placeholder="Min 8 characters"
          {...r2('newPassword', { required: true, minLength: 8 })} />
      </div>
      <button className="btn btn-primary btn-block btn-lg" disabled={s2}>
        {s2 ? <span className="spinner spinner-sm" /> : 'Reset Password'}
      </button>
    </form>
  )

  return (
    <form onSubmit={hs1(onSend)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Enter your email to receive a password reset code.
      </p>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input className="form-input" type="email" placeholder="name@company.com"
          {...r1('username', { required: true })} />
      </div>
      <button className="btn btn-primary btn-block btn-lg" disabled={s1}>
        {s1 ? <span className="spinner spinner-sm" /> : 'Send Reset Code'}
      </button>
    </form>
  )
}
