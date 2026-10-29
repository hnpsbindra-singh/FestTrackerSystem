import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-zinc-200/90 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900">
                MakeMyPlan
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              The premier college fest and cultural festival tracker. Discover live concerts, hackathons, esports tournaments, and campus events near you.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Direct-to-organiser payments & verified digital tickets</span>
            </div>
          </div>

          {/* Attendee links */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              For Students
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <Link to="/discover" className="hover:text-zinc-900 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3 h-3" />
                  <span>Discover Fests</span>
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-zinc-900 transition-colors">
                  My Bookings & Tickets
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-zinc-900 transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Organiser links */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
              For Organisers
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li>
                <Link to="/organiser/events/create" className="hover:text-zinc-900 transition-colors">
                  Publish Your Fest
                </Link>
              </li>
              <li>
                <Link to="/organiser/events" className="hover:text-zinc-900 transition-colors">
                  Organiser Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-zinc-900 transition-colors">
                  Organiser Portal Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
          <p>© {new Date().getFullYear()} MakeMyPlan. All rights reserved.</p>
          <p className="text-[11px]">
            Engineered with Spring Boot, PostgreSQL, Redis, Kafka & React
          </p>
        </div>
      </div>
    </footer>
  );
};
