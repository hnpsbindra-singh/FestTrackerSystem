import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { organiserService } from '@/services/organiser.service';
import { formatDate, formatTime } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { parseApiError } from '@/lib/errors';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Scan,
  Sparkles,
} from 'lucide-react';

export const OrganiserDashboardPage: React.FC = () => {
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organiser-events'],
    queryFn: () => organiserService.viewAllEvents(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-600" />
            <span>Organiser Workspace</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your collegiate festivals, attendee registrations, and gate check-in
          </p>
        </div>

        <Link to="/organiser/events/create">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Host New Fest
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      {isError ? (
        <ErrorAlert
          title="Failed to load your events"
          message={parseApiError(error, 'An error occurred while fetching your hosted events.')}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
              <Skeleton className="w-full h-36 rounded-lg" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-zinc-400" />}
          title="No fests created yet"
          description="You haven't published any college events under your organiser account. Host your first fest to configure seating tiers, UPI details, and registration."
          actionLabel="Host Your First Fest"
          onAction={() => window.location.assign('/organiser/events/create')}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Your Hosted Events ({events.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition-all flex flex-col overflow-hidden"
              >
                {/* Poster or placeholder */}
                <div className="aspect-16/9 w-full bg-zinc-100 overflow-hidden relative">
                  {event.posterUrl ? (
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <h3 className="font-semibold text-base text-zinc-900 line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatDate(event.date)}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formatTime(event.time)}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="truncate">{event.detailedAddress}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-zinc-100 grid grid-cols-2 gap-2">
                    <Link to={`/organiser/events/${event.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Users className="w-3.5 h-3.5" />}
                        className="w-full text-xs"
                      >
                        Manage & Roster
                      </Button>
                    </Link>

                    <Link to={`/organiser/events/${event.id}/verify`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Scan className="w-3.5 h-3.5" />}
                        className="w-full text-xs"
                      >
                        Gate Scanner
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
