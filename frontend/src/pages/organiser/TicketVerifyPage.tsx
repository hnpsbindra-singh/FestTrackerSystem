import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organiserService } from '@/services/organiser.service';
import { TicketScanner } from '@/features/organiser/TicketScanner';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { ArrowLeft } from 'lucide-react';

export const TicketVerifyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ['organiser-event-detail', id],
    queryFn: () => organiserService.getEventDetails(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="w-32 h-8" />
        <Skeleton className="w-full h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div>
        <Link
          to={`/organiser/events/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Event Details</span>
        </Link>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Gate Ticket Verification
        </h1>
        <p className="text-xs text-zinc-500">
          Fast verification and check-in scanner for {event?.title || 'this fest'}
        </p>
      </div>

      <TicketScanner eventId={id!} eventTitle={event?.title || 'Campus Fest'} />
    </div>
  );
};
