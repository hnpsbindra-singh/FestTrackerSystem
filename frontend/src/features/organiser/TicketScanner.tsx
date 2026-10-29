import React, { useState } from 'react';
import { organiserService } from '@/services/organiser.service';
import { parseApiError } from '@/lib/errors';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CheckCircle2, QrCode, Scan, XCircle } from 'lucide-react';

export interface TicketScannerProps {
  eventId: string;
  eventTitle: string;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({
  eventId,
  eventTitle,
}) => {
  const [bookingKey, setBookingKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    key: string;
    timestamp: Date;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = bookingKey.trim().toUpperCase();
    if (!cleanKey) return;

    setIsVerifying(true);
    try {
      const msg = await organiserService.verifyTicket(eventId, cleanKey);
      setVerificationResult({
        success: true,
        message: msg || 'Valid ticket. Check-in registered successfully.',
        key: cleanKey,
        timestamp: new Date(),
      });
      setBookingKey('');
    } catch (err) {
      setVerificationResult({
        success: false,
        message: parseApiError(err, 'Invalid ticket key, already checked in, or payment not submitted.'),
        key: cleanKey,
        timestamp: new Date(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 p-5 shadow-xs max-w-xl mx-auto space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
          <Scan className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Gate Ticket Validation</h3>
          <p className="text-xs text-zinc-500">Checking in attendees for {eventTitle}</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-3">
        <Input
          label="Booking Key"
          placeholder="e.g. FT-9K42-L7M8"
          value={bookingKey}
          onChange={(e) => setBookingKey(e.target.value)}
          leftAddon={<QrCode className="w-4 h-4 text-zinc-400" />}
          helperText="Format: FT-XXXX-XXXX (printed on attendee confirmation or email)"
          autoFocus
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          isLoading={isVerifying}
          disabled={!bookingKey.trim()}
        >
          Verify & Admit Attendee
        </Button>
      </form>

      {/* Verification Result Feedback */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in zoom-in-95 duration-150 ${
            verificationResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {verificationResult.success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold">
              {verificationResult.success ? 'Ticket Verified — Admitted' : 'Verification Rejected'}
            </h4>
            <p className="text-xs mt-0.5 leading-relaxed">{verificationResult.message}</p>
            <div className="mt-2 text-[11px] opacity-75 font-mono">
              Key: {verificationResult.key} • {verificationResult.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
