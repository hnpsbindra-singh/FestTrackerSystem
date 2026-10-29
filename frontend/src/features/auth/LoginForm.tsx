import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await login({
        username: username.toLowerCase().trim(),
        password,
      });

      toast.success('Welcome back!', `Signed in as ${user.username}`);

      // Check if user came from a protected route
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ORGANISER') {
        navigate('/organiser/events', { replace: true });
      } else {
        navigate('/discover', { replace: true });
      }
    } catch (err) {
      setError(parseApiError(err, 'Failed to sign in. Please verify your credentials or ensure your email has been verified.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="student@university.edu"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftAddon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Forgot password?
            </button>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
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
            autoComplete="current-password"
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
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-500">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-zinc-900 hover:underline">
          Create an account
        </Link>
      </p>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        defaultEmail={username}
      />
    </div>
  );
};
