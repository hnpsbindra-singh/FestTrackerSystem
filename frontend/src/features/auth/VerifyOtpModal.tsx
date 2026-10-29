import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { MailCheck } from 'lucide-react';

export interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onVerified: () => void;
}

export const VerifyOtpModal: React.FC<VerifyOtpModalProps> = ({
  isOpen,
  onClose,
  username,
  onVerified,
}) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification OTP');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.verifyOtp({
        username: username.toLowerCase().trim(),
        otp: otp.trim(),
      });
      toast.success('Registration Complete!', 'Your account has been verified. You can now log in.');
      onVerified();
    } catch (err) {
      setError(parseApiError(err, 'Invalid or expired OTP. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);
    try {
      await authService.sendOtp(username.toLowerCase().trim());
      toast.info('OTP Sent', 'A fresh verification OTP has been sent to your email.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to resend OTP.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Your Email"
      description={`Enter the 6-digit OTP sent to ${username}`}
      maxWidth="sm"
    >
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
          <MailCheck className="w-6 h-6" />
        </div>

        <Input
          label="Verification OTP"
          placeholder="e.g. 583921"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          error={error || undefined}
          helperText="Check your email inbox or spam folder for the one-time code."
          autoFocus
          required
        />

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || isSubmitting}
            className="text-zinc-900 font-semibold hover:underline disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
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
            Verify & Activate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
