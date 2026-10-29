import React, { useState } from 'react';
import { BookingDetails } from '@/types/booking.types';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { EmptyState } from '@/components/common/EmptyState';
import { TableRowSkeleton } from '@/components/common/LoadingSkeleton';
import { organiserService } from '@/services/organiser.service';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import { UserCheck, XCircle, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AttendeesTableProps {
  eventId: string;
  bookings: BookingDetails[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;
}

export const AttendeesTable: React.FC<AttendeesTableProps> = ({
  eventId,
  bookings,
  isLoading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onRefresh,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [isDeclining, setIsDeclining] = useState(false);
  const toast = useToast();

  const handleDeclineTicket = async () => {
    if (!selectedBooking) return;
    setIsDeclining(true);

    try {
      const msg = await organiserService.declineTicket(eventId, selectedBooking.id);
      toast.success('Ticket Declined', msg || 'Booking cancelled and seats restored to event.');
      setSelectedBooking(null);
      onRefresh();
    } catch (err) {
      toast.error('Decline Failed', parseApiError(err, 'Failed to decline booking.'));
    } finally {
      setIsDeclining(false);
    }
  };

  if (!isLoading && bookings.length === 0) {
    return (
      <EmptyState
        icon={<UserCheck className="w-6 h-6 text-zinc-400" />}
        title="No verified bookings yet"
        description="When attendees book tickets and complete their payments, their reservation details will appear here."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Attendee</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Tier & Slots</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Transaction Ref</th>
              <th className="py-3 px-4">Booked At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {isLoading ? (
              <>
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
                <TableRowSkeleton columns={7} />
              </>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-zinc-900">
                    {b.customerName}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600">
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{b.customerUsername}</span>
                    </div>
                    {b.customerMobile && (
                      <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{b.customerMobile}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-700">
                    <span className="font-medium text-zinc-900">{b.seatingName}</span>
                    <span className="block text-zinc-500 text-[11px]">
                      {b.slots} {b.slots === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-zinc-900">
                    {formatCurrency(Number(b.totalCost))}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-700 bg-zinc-50/50">
                    {b.transactionId || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                    {formatDateTime(b.bookingDatetime)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBooking(b)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs px-2 py-1 h-7"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Decline
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
          <span className="text-xs text-zinc-500">
            Showing page {page + 1} of {totalPages} ({totalElements} total bookings)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {selectedBooking && (
        <ConfirmModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleDeclineTicket}
          title="Decline Attendee Ticket"
          message={`Are you sure you want to decline ticket reservation for "${selectedBooking.customerName}" (Ref: ${selectedBooking.transactionId})? This will restore ${selectedBooking.slots} seats and send a cancellation notice email to the attendee.`}
          confirmLabel="Yes, Decline Ticket"
          isLoading={isDeclining}
          variant="danger"
        />
      )}
    </div>
  );
};
