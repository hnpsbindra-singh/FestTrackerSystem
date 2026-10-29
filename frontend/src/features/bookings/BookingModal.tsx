import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SeatingTierSelector } from '@/components/events/SeatingTierSelector';
import { FestInformationBrief, SeatingDetails } from '@/types/event.types';
import { BookingResponse } from '@/types/booking.types';
import { userService } from '@/services/user.service';
import { parseApiError } from '@/lib/errors';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { PaymentConfirmModal } from './PaymentConfirmModal';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: FestInformationBrief;
  tiers: SeatingDetails[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  event,
  tiers,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    tiers.length > 0 ? tiers[0].id : null
  );
  const [slots, setSlots] = useState<number>(1);
  const [isInitiating, setIsInitiating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const selectedTier = tiers.find((t) => t.id === selectedTierId);
  const totalAmount = selectedTier ? Number(selectedTier.price) * slots : 0;

  const handleInitiateBooking = async () => {
    if (!selectedTierId) {
      setError('Please select a seating category to proceed');
      return;
    }

    setIsInitiating(true);
    setError(null);

    try {
      const response = await userService.initiateBooking({
        festId: event.id,
        seatingTypeId: selectedTierId,
        slots,
      });

      setBookingResponse(response);
      setShowPaymentModal(true);
    } catch (err) {
      setError(parseApiError(err, 'Failed to reserve ticket slots. Please try again.'));
    } finally {
      setIsInitiating(false);
    }
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setBookingResponse(null);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showPaymentModal}
        onClose={onClose}
        title="Reserve Event Tickets"
        description="Choose your ticket tier and number of slots"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Quick Event Summary */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
            <h4 className="font-semibold text-zinc-900 text-sm">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {formatTime(event.time)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {event.detailedAddress}
              </span>
            </div>
          </div>

          {/* Seating Category Selector */}
          <SeatingTierSelector
            tiers={tiers}
            selectedTierId={selectedTierId}
            onSelectTier={setSelectedTierId}
            slots={slots}
            onSlotsChange={setSlots}
            disabled={isInitiating}
          />

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing Summary */}
          {selectedTier && (
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">Total Due</span>
                <span className="text-lg font-bold text-zinc-900">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  ({slots} {slots === 1 ? 'ticket' : 'tickets'} × {formatCurrency(Number(selectedTier.price))})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isInitiating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleInitiateBooking}
                  isLoading={isInitiating}
                  disabled={!selectedTier || selectedTier.availableSeats < slots}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Payment Confirmation Modal */}
      {bookingResponse && (
        <PaymentConfirmModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          bookingData={bookingResponse}
          eventTitle={event.title}
        />
      )}
    </>
  );
};
