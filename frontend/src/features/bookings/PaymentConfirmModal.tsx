import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { BookingResponse } from '@/types/booking.types';
import { formatCurrency } from '@/utils/formatters';
import { userService } from '@/services/user.service';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { CheckCircle2, Copy, QrCode, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingResponse | null;
  eventTitle: string;
}

export const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  eventTitle,
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingKey, setConfirmedBookingKey] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (!bookingData) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard', `${label} copied`);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Transaction ID or UPI Reference Number is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const responseMessage = await userService.confirmBooking(bookingData.bookingId, {
        transactionId: transactionId.trim(),
      });

      // Extract booking key if present in string response (e.g. "Booking Submitted Successfully! Booking Key: FT-ABCD-1234")
      const keyMatch = responseMessage.match(/Booking Key:\s*([A-Za-z0-9-]+)/i);
      const key = keyMatch ? keyMatch[1] : 'Generated';
      setConfirmedBookingKey(key);
      toast.success('Booking Submitted Successfully!', 'Check your email for the confirmation ticket.');
    } catch (err) {
      setError(parseApiError(err, 'Failed to confirm payment. Please check your transaction details.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    navigate('/bookings');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={confirmedBookingKey ? handleFinish : onClose}
      title={confirmedBookingKey ? 'Booking Confirmed!' : 'Complete Payment & Submit'}
      description={confirmedBookingKey ? 'Your ticket reservation is confirmed' : `Event: ${eventTitle}`}
      maxWidth="md"
    >
      {confirmedBookingKey ? (
        <div className="text-center py-4 space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-zinc-900">Ticket Reserved!</h4>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Your payment verification details have been recorded. Keep your unique booking key handy for gate check-in.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Official Booking Key
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <Ticket className="w-3.5 h-3.5" />
                Valid Ticket
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-base font-bold text-zinc-900 tracking-wider">
                {confirmedBookingKey}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(confirmedBookingKey, 'Booking Key')}
                leftIcon={<Copy className="w-3 h-3" />}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" onClick={handleFinish} className="w-full">
              View In My Bookings
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmPayment} className="space-y-5">
          {/* Amount Due Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 block">Total Amount Payable</span>
              <span className="text-lg font-bold">{formatCurrency(bookingData.totalCost)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-zinc-800 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Organiser</span>
            </div>
          </div>

          {/* QR Code and Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Payment QR */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-center">
              {bookingData.paymentQrURL ? (
                <img
                  src={bookingData.paymentQrURL}
                  alt="UPI Payment QR Code"
                  className="w-36 h-36 object-contain rounded-lg bg-white p-1 border border-zinc-200"
                />
              ) : (
                <div className="w-36 h-36 flex flex-col items-center justify-center text-zinc-400">
                  <QrCode className="w-10 h-10 mb-1" />
                  <span className="text-xs">QR unavailable</span>
                </div>
              )}
              <span className="mt-2 text-[11px] text-zinc-500 font-medium">
                Scan with any UPI App (GPay, PhonePe, Paytm)
              </span>
            </div>

            {/* Bank Transfer Details */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50">
                <span className="text-zinc-500 block text-[11px]">Account Holder</span>
                <span className="font-semibold text-zinc-900">
                  {bookingData.accountHolderName || 'Fest Organiser'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[11px]">Bank Account No.</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {bookingData.bankAccountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bookingData.bankAccountNumber, 'Account Number')}
                  className="text-zinc-400 hover:text-zinc-700 p-1"
                  title="Copy account number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 block text-[11px]">IFSC Code</span>
                  <span className="font-mono font-semibold text-zinc-900">
                    {bookingData.ifscCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bookingData.ifscCode, 'IFSC Code')}
                  className="text-zinc-400 hover:text-zinc-700 p-1"
                  title="Copy IFSC code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="pt-2 border-t border-zinc-100">
            <Input
              label="Transaction ID / UTR / Reference No."
              placeholder="e.g. 431289012345 or UPI ref id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              error={error || undefined}
              helperText="Enter the 12-digit UPI transaction reference or bank transfer ID after completing payment"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              size="md"
              isLoading={isSubmitting}
            >
              Verify & Confirm Booking
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
