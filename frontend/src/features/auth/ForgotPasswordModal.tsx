import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { KeyRound } from 'lucide-react';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.sendOtp(email.toLowerCase().trim());
      toast.info('OTP Sent', `A reset code has been sent to ${email}`);
      setStep('reset');
    } catch (err) {
      setError(parseApiError(err, 'Failed to send password reset code.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 15) {
      setError('Password must be between 8 and 15 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.resetPassword({
        username: email.toLowerCase().trim(),
        otp: otp.trim(),
        newPassword,
      });
      toast.success('Password Updated', 'You can now log in with your new password.');
      onClose();
    } catch (err) {
      setError(parseApiError(err, 'Failed to update password. Verify your OTP and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setStep('request');
    setError(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={step === 'request' ? 'Reset Your Password' : 'Enter New Password'}
      description={
        step === 'request'
          ? 'Enter your registered email to receive a password reset OTP'
          : `Enter the code sent to ${email}`
      }
      maxWidth="sm"
    >
      {step === 'request' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>

          <Input
            label="Account Email"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Send Reset Code
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Verification OTP"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
            autoFocus
          />

          <Input
            label="New Password"
            type="password"
            placeholder="8 to 15 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Must be 8-15 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-xs text-rose-600 font-medium" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep('request')}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Update Password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
