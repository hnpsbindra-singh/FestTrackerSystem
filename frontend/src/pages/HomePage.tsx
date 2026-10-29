import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, PlusCircle, ArrowRight, ShieldCheck, Ticket, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative border-b border-zinc-200/80 bg-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span>Campus Event & Fest Discovery Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight sm:leading-none">
            Discover college fests.<br />
            <span className="text-zinc-500">Book verified passes in seconds.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 leading-relaxed">
            MakeMyPlan connects students directly with collegiate fests, hackathons, and cultural events. Browse events near your campus, secure tickets, and get verified digital entry keys.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/discover">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Compass className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Explore Nearby Fests
              </Button>
            </Link>

            {user?.role === 'ORGANISER' ? (
              <Link to="/organiser/events/create">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Create New Fest
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Register as Organiser
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <MapPin className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              Proximity-Based Discovery
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Find festivals happening right around your university or filter by custom radius using precise geospatial search.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              Direct & Transparent Bookings
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Pay directly to student societies and verified college fest accounts via direct UPI with zero third-party markups.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
              <Ticket className="w-5 h-5 text-zinc-800" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              Verified Digital Entry Pass
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Receive unique booking keys and instant email receipts that get scanned seamlessly at the college gates.
            </p>
          </div>
        </div>
      </section>

      {/* Student vs Organiser Banner */}
      <section className="border-t border-zinc-200 bg-zinc-100/60 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Are you hosting a campus event?
              </span>
              <h2 className="text-2xl font-bold text-zinc-900">
                Manage ticket tiers, payments & gate verification
              </h2>
              <p className="text-xs text-zinc-500 max-w-lg leading-relaxed">
                MakeMyPlan gives student bodies and fest committees complete control over ticket categories, capacity limits, attendee rosters, and gate validation.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link to="/register">
                <Button variant="primary" size="md" leftIcon={<Users className="w-4 h-4" />}>
                  Host an Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
