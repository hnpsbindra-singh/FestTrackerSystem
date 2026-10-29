import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';
import { PaymentStatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { TableRowSkeleton } from '@/components/common/LoadingSkeleton';
import { parseApiError } from '@/lib/errors';
import { useToast } from '@/hooks/useToast';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Copy,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const pageSize = 10;
  const toast = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-bookings', page],
    queryFn: () => userService.getBookingsHistory(page, pageSize),
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.info('Copied!', `Booking Key ${key} copied to clipboard`);
  };

  const bookings = data?.content || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Ticket className="w-6 h-6 text-brand-600" />
          <span>My Passes & Bookings</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Your registered college fest passes, payment status, and gate entry keys
        </p>
      </div>

      {/* Main Content */}
      {isError ? (
        <ErrorAlert
          title="Failed to load your booking history"
          message={parseApiError(error, 'An error occurred while fetching your bookings.')}
          onRetry={() => refetch()}
        />
      ) : !isLoading && bookings.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-8 h-8 text-zinc-400" />}
          title="No fest bookings found"
          description="You haven't reserved tickets for any college fests yet. Explore upcoming fests near your campus and reserve your entry passes."
          actionLabel="Discover Upcoming Fests"
          onAction={() => window.location.assign('/discover')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Fest & Schedule</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Tier & Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Entry Booking Key</th>
                  <th className="py-3.5 px-4">Gate Status</th>
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
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-semibold text-zinc-900 block text-sm">
                          {booking.festTitle}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {formatDate(booking.festDate)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {formatTime(booking.festTime)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-zinc-600 max-w-[200px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="truncate">{booking.detailedAddress}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-zinc-800">{booking.seatingName}</span>
                        <span className="block text-zinc-400 text-[11px] mt-0.5">
                          {booking.slots} {booking.slots === 1 ? 'slot' : 'slots'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {formatCurrency(Number(booking.totalCost))}
                      </td>

                      <td className="py-4 px-4">
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </td>

                      <td className="py-4 px-4">
                        {booking.bookingKey ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-md w-fit">
                            <span>{booking.bookingKey}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(booking.bookingKey!)}
                              className="text-zinc-400 hover:text-zinc-700 p-0.5"
                              title="Copy Booking Key"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">
                            Pending Payment
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {booking.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Admitted
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">
                            Not Checked In
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
              <span className="text-xs text-zinc-500">
                Page {page + 1} of {data.totalPages} ({data.totalElements} records)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 0}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
