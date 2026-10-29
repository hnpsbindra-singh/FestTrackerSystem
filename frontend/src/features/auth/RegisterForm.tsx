import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { UserRole } from '@/types/auth.types';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { VerifyOtpModal } from './VerifyOtpModal';
import { Eye, EyeOff, Lock, Mail, Phone, User, Users, Shield } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!username.trim() || !username.includes('@')) {
      setError('A valid email address is required');
      return;
    }
    if (password.length < 8 || password.length > 15) {
      setError('Password must be between 8 and 15 characters');
      return;
    }
    const mobileClean = mobile.trim();
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        password,
        mobile: mobileClean,
        role,
      });

      toast.info('Verification Code Sent', `We sent a 6-digit OTP to ${username}`);
      setShowOtpModal(true);
    } catch (err) {
      setError(parseApiError(err, 'Registration failed. This email may already be registered.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerified = () => {
    setShowOtpModal(false);
    navigate('/login', { state: { prefilledEmail: username } });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                role === 'USER'
                  ? 'border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  role === 'USER' ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
                }`}
              >
                {role === 'USER' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-900 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                  Attendee / Student
                </span>
                <span className="block text-[11px] text-zinc-500 mt-0.5">
                  Discover and register for fests
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('ORGANISER')}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                role === 'ORGANISER'
                  ? 'border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                  role === 'ORGANISER' ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-300'
                }`}
              >
                {role === 'ORGANISER' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-900 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-zinc-600" />
                  Fest Organiser
                </span>
                <span className="block text-[11px] text-zinc-500 mt-0.5">
                  Host fests & verify bookings
                </span>
              </div>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          placeholder="e.g. Aarav Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftAddon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="aarav@university.edu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftAddon={<Mail className="w-4 h-4" />}
          helperText="We will send an OTP to this email address to verify your account"
          required
        />

        <Input
          label="Mobile Number (10 digits)"
          type="tel"
          placeholder="9876543210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          leftAddon={<Phone className="w-4 h-4" />}
          maxLength={10}
          helperText="Required format: 10 digits starting with 6-9"
          required
        />

        <div>
          <Input
            label="Password (8-15 characters)"
            type={showPassword ? 'text' : 'password'}
            placeholder="Choose a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftAddon={<Lock className="w-4 h-4" />}
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            minLength={8}
            maxLength={15}
            helperText="8 to 15 characters strictly enforced by backend"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isSubmitting}
        >
          Create Account & Send OTP
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-zinc-900 hover:underline">
          Sign In
        </Link>
      </p>

      {/* Verification OTP Modal */}
      <VerifyOtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        username={username}
        onVerified={handleVerified}
      />
    </div>
  );
};
