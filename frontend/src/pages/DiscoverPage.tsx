import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userService } from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EventCard } from '@/components/events/EventCard';
import { LocationPicker } from '@/components/events/LocationPicker';
import { EventCardSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { Button } from '@/components/common/Button';
import { parseApiError } from '@/lib/errors';
import { Search, ChevronLeft, ChevronRight, Lock, Sparkles, Filter } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    coords,
    setCoords,
    radius,
    setRadius,
    isDetecting,
    requestBrowserLocation,
  } = useGeolocation();

  const [page, setPage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');

  const pageSize = 9;

  // Only execute query if user is authenticated with USER role (as required by backend SecurityConfig)
  const isEligibleToFetch = isAuthenticated && user?.role === 'USER';

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['events-nearby', coords.latitude, coords.longitude, radius, page],
    queryFn: () =>
      userService.findNearbyEvents({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius,
        page,
        size: pageSize,
      }),
    enabled: isEligibleToFetch,
    staleTime: 60 * 1000,
  });

  // Extract unique genres for client-side filtering
  const allEvents = data?.content || [];
  const genres = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.genre) set.add(ev.genre.trim());
    });
    return Array.from(set);
  }, [allEvents]);

  // Client-side filtering by search query & genre
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.detailedAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGenre =
        selectedGenre === 'ALL' ||
        ev.genre?.toLowerCase() === selectedGenre.toLowerCase();

      return matchesSearch && matchesGenre;
    });
  }, [allEvents, searchQuery, selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Page Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Discover College Fests</span>
            {isFetching && (
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
            )}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Real-time geospatial fest discovery powered by MakeMyPlan
          </p>
        </div>

        {/* Quick action for organisers */}
        {user?.role === 'ORGANISER' && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <span>You are logged in as an Organiser.</span>
            <Link to="/organiser/events" className="font-semibold underline">
              View Your Events & Roster
            </Link>
          </div>
        )}
      </div>

      {/* Auth Guard Banner if unauthenticated */}
      {!isAuthenticated && (
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-700">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900">
            Sign In to Discover Nearby Events
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
            Campus fest queries, ticketing schedules, and direct registrations are accessible to registered student accounts. Create a free account or log in to explore fests.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Geolocation & Region Controller */}
      {isEligibleToFetch && (
        <LocationPicker
          coords={coords}
          onCoordsChange={(newCoords) => {
            setCoords(newCoords);
            setPage(0);
          }}
          radius={radius}
          onRadiusChange={(newRadius) => {
            setRadius(newRadius);
            setPage(0);
          }}
          onDetectLocation={requestBrowserLocation}
          isDetecting={isDetecting}
        />
      )}

      {/* Filter & Search Bar */}
      {isEligibleToFetch && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search fests by title, artist, or campus address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-zinc-200 bg-white pl-9 pr-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-xs"
            />
          </div>

          {/* Genre Filter Pills */}
          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" />
                Genre:
              </span>
              <button
                type="button"
                onClick={() => setSelectedGenre('ALL')}
                className={`px-2.5 py-1 text-xs rounded-lg border shrink-0 transition-colors ${
                  selectedGenre === 'ALL'
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                All
              </button>
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`px-2.5 py-1 text-xs rounded-lg border shrink-0 transition-colors ${
                    selectedGenre === g
                      ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Listing Section */}
      {isEligibleToFetch && (
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <ErrorAlert
              title="Unable to load nearby fests"
              message={parseApiError(error, 'An error occurred while querying the events service.')}
              onRetry={() => refetch()}
            />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-6 h-6 text-zinc-400" />}
              title="No events found within this radius"
              description={`We couldn't find any active fests within ${radius} km of ${coords.name || 'your location'}. Try increasing the radius to 250 km or 500 km or selecting a different college hub.`}
              actionLabel="Expand Radius to 250 km"
              onAction={() => setRadius(250)}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination controls */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
                  <span className="text-xs text-zinc-500">
                    Showing page {page + 1} of {data.totalPages} ({data.totalElements} fests found)
                  </span>

                  <div className="flex items-center gap-2">
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
        </section>
      )}
    </div>
  );
};
