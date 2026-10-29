import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organiserService } from '@/services/organiser.service';
import { AttendeesTable } from '@/features/organiser/AttendeesTable';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Scan,
  AlertTriangle,
  Users,
  CreditCard,
  Tag,
} from 'lucide-react';

export const OrganiserEventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [bookingsPage, setBookingsPage] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch Entire Fest Details
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
    error: eventError,
    refetch: refetchEvent,
  } = useQuery({
    queryKey: ['organiser-event-detail', id],
    queryFn: () => organiserService.getEventDetails(id!),
    enabled: !!id,
  });

  // Fetch Seating Details
  const {
    data: seatingTiers = [],
    isLoading: isSeatingLoading,
    refetch: refetchSeating,
  } = useQuery({
    queryKey: ['organiser-event-seats', id],
    queryFn: () => organiserService.getSeatingDetails(id!),
    enabled: !!id,
  });

  // Fetch Bookings Roster
  const {
    data: bookingsData,
    isLoading: isBookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['organiser-event-bookings', id, bookingsPage],
    queryFn: () => organiserService.getBookingDetails(id!, bookingsPage, 10),
    enabled: !!id,
  });

  const handleCancelFest = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const msg = await organiserService.cancelEvent(id);
      toast.success('Fest Cancelled', msg || 'All registered attendees have been notified.');
      setShowCancelModal(false);
      refetchEvent();
    } catch (err) {
      toast.error('Cancellation Failed', parseApiError(err, 'Failed to cancel event.'));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isEventLoading || isSeatingLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-full h-48 rounded-xl" />
        <Skeleton className="w-full h-72 rounded-xl" />
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorAlert
          title="Failed to load event details"
          message={parseApiError(eventError, 'Event could not be found or you do not have permission.')}
          onRetry={() => {
            refetchEvent();
            refetchSeating();
          }}
        />
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/organiser/events')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to My Events
          </Button>
        </div>
      </div>
    );
  }

  const totalSeatsCapacity = seatingTiers.reduce((acc, s) => acc + s.totalSeats, 0);
  const totalSeatsAvailable = seatingTiers.reduce((acc, s) => acc + s.availableSeats, 0);
  const totalSeatsBooked = totalSeatsCapacity - totalSeatsAvailable;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/organiser/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Events</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {event.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Event Management, Seating Inventory & Attendee Roster
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link to={`/organiser/events/${id}/verify`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Scan className="w-3.5 h-3.5" />}
            >
              Gate Scanner
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            Cancel Fest
          </Button>
        </div>
      </div>

      {/* Key Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Schedule */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Schedule & Venue
          </span>
          <p className="text-xs font-semibold text-zinc-900">
            {formatDate(event.date)} at {formatTime(event.time)}
          </p>
          <div className="flex items-start gap-1 text-xs text-zinc-500">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>{event.detailedAddress}</span>
          </div>
        </div>

        {/* Capacity / Inventory */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Ticket Sales
          </span>
          <p className="text-xl font-bold text-zinc-900">
            {totalSeatsBooked}{' '}
            <span className="text-xs font-normal text-zinc-500">
              / {totalSeatsCapacity} seats reserved
            </span>
          </p>
          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${totalSeatsCapacity > 0 ? (totalSeatsBooked / totalSeatsCapacity) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Bank & Payout Summary */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5" />
            Payout Account
          </span>
          <p className="text-xs font-semibold text-zinc-900 truncate">
            {event.accountHolderName}
          </p>
          <p className="text-xs text-zinc-500 font-mono">
            {event.bankAccountNumber} ({event.ifscCode})
          </p>
        </div>
      </div>

      {/* Seating Tiers Breakdown */}
      <div className="bg-white rounded-xl border border-zinc-200/90 p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Seating Tiers & Inventory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {seatingTiers.map((tier) => (
            <div
              key={tier.id}
              className="p-3.5 rounded-lg border border-zinc-200 bg-zinc-50/50 space-y-1"
            >
              <span className="font-semibold text-xs text-zinc-900 block truncate">
                {tier.name}
              </span>
              <span className="text-sm font-bold text-zinc-900 block">
                {formatCurrency(Number(tier.price))}
              </span>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                <span>Available: {tier.availableSeats}</span>
                <span>Total: {tier.totalSeats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendee Registrations Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Verified Attendee Bookings ({bookingsData?.totalElements || 0})
          </h2>
        </div>

        <AttendeesTable
          eventId={id!}
          bookings={bookingsData?.content || []}
          isLoading={isBookingsLoading}
          page={bookingsPage}
          totalPages={bookingsData?.totalPages || 1}
          totalElements={bookingsData?.totalElements || 0}
          onPageChange={setBookingsPage}
          onRefresh={() => {
            refetchBookings();
            refetchSeating();
          }}
        />
      </div>

      {/* Cancellation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelFest}
        title="Cancel Campus Fest"
        message={`Are you sure you want to cancel "${event.title}"? This will deactivate the fest and trigger automatic email notifications via Kafka to all registered attendees.`}
        confirmLabel="Yes, Cancel Event"
        isLoading={isCancelling}
        variant="danger"
      />
    </div>
  );
};
