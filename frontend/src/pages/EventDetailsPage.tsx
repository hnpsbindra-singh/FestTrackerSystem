import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatTime, formatCurrency } from '@/utils/formatters';
import { BookingModal } from '@/features/bookings/BookingModal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { parseApiError } from '@/lib/errors';
import {
  Calendar,
  MapPin,
  Users,
  Shield,
  Ticket,
  ArrowLeft,
  Hourglass,
  Tag,
  AlertOctagon,
} from 'lucide-react';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch event brief
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
    error: eventError,
    refetch: refetchEvent,
  } = useQuery({
    queryKey: ['event-details', id],
    queryFn: () => userService.getEventDetails(id!),
    enabled: !!id && isAuthenticated && user?.role === 'USER',
  });

  // Fetch event seating tiers
  const {
    data: seatingTiers = [],
    isLoading: isSeatingLoading,
    refetch: refetchSeating,
  } = useQuery({
    queryKey: ['event-seating', id],
    queryFn: () => userService.getSeatingDetails(id!),
    enabled: !!id && isAuthenticated && user?.role === 'USER',
  });

  if (!isAuthenticated || user?.role !== 'USER') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-700">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Sign in to view event details & reserve passes</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Detailed festival schedules, remaining seats, and registration are protected for registered students.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/login" state={{ from: { pathname: `/events/${id}` } }}>
            <Button variant="primary" size="md">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isEventLoading || isSeatingLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="w-24 h-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full h-72 rounded-xl" />
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-24" />
          </div>
          <div className="space-y-4">
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorAlert
          title="Event not found"
          message={parseApiError(eventError, 'The requested fest could not be loaded.')}
          onRetry={() => {
            refetchEvent();
            refetchSeating();
          }}
        />
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/discover')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Discovery
          </Button>
        </div>
      </div>
    );
  }

  // Calculate lowest ticket price
  const lowestPrice =
    seatingTiers.length > 0
      ? Math.min(...seatingTiers.map((t) => Number(t.price)))
      : null;

  const totalAvailableSeats = seatingTiers.reduce((acc, t) => acc + t.availableSeats, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Fests</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Poster & Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster Banner */}
          {event.posterUrl && (
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xs">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {!event.active && (
                <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-rose-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
                    <AlertOctagon className="w-5 h-5" />
                    <span>This event has been cancelled by the organiser</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {event.genre && <Badge variant="neutral">{event.genre}</Badge>}
              {event.language && <Badge variant="neutral">{event.language}</Badge>}
              {event.ageLimit > 0 && <Badge variant="neutral">{event.ageLimit}+ Yrs</Badge>}
              {event.duration && (
                <Badge variant="neutral" className="flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-zinc-400" />
                  {event.duration}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {event.title}
            </h1>

            {event.organiserName && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span>Organised by <strong className="text-zinc-800">{event.organiserName}</strong></span>
              </div>
            )}
          </div>

          {/* Key Facts / Schedule & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Date & Time
                </span>
                <span className="block text-xs font-semibold text-zinc-900 mt-0.5">
                  {formatDate(event.date)}
                </span>
                <span className="block text-xs text-zinc-500">
                  {formatTime(event.time)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Campus Venue / Address
                </span>
                <span className="block text-xs font-semibold text-zinc-900 mt-0.5">
                  {event.detailedAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              About This Fest
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right Column: Ticket Booking Card */}
        <div className="space-y-4 sticky top-24">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Passes Starting From
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-zinc-900">
                  {lowestPrice !== null ? formatCurrency(lowestPrice) : 'Free'}
                </span>
                <span className="text-xs text-zinc-500">per person</span>
              </div>
            </div>

            {/* Seating Inventory Summary */}
            <div className="space-y-2 border-t border-b border-zinc-100 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Available Tiers ({seatingTiers.length})
              </span>
              <div className="space-y-1.5">
                {seatingTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span className="font-medium text-zinc-800">{tier.name}</span>
                    <div className="text-right">
                      <span className="font-semibold text-zinc-900 block">
                        {formatCurrency(Number(tier.price))}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {tier.availableSeats > 0 ? (
                          `${tier.availableSeats} left`
                        ) : (
                          <span className="text-rose-500">Sold Out</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Action */}
            <div>
              {event.active ? (
                totalAvailableSeats > 0 ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    leftIcon={<Ticket className="w-4 h-4" />}
                    onClick={() => setShowBookingModal(true)}
                  >
                    Select Seats & Register
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" className="w-full" disabled>
                    All Tiers Sold Out
                  </Button>
                )
              ) : (
                <Button variant="danger" size="lg" className="w-full" disabled>
                  Fest Cancelled
                </Button>
              )}
            </div>

            <p className="text-center text-[11px] text-zinc-400">
              Immediate UPI verification & instant digital booking key
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal Flow */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            refetchSeating();
          }}
          event={event}
          tiers={seatingTiers}
        />
      )}
    </div>
  );
};
