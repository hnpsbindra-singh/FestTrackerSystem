import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import {
  Compass,
  Ticket,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'bg-zinc-900 text-white'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-zinc-900 text-white'
        : 'text-zinc-700 hover:bg-zinc-100'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-brand-600 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-zinc-900 tracking-tight block">
                MakeMyPlan
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block -mt-0.5">
                Fest & Event Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/discover" className={navLinkClass}>
              <Compass className="w-4 h-4" />
              <span>Discover Fests</span>
            </NavLink>

            {isAuthenticated && user?.role === 'USER' && (
              <NavLink to="/bookings" className={navLinkClass}>
                <Ticket className="w-4 h-4" />
                <span>My Bookings</span>
              </NavLink>
            )}

            {isAuthenticated && user?.role === 'ORGANISER' && (
              <>
                <NavLink to="/organiser/events" className={navLinkClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Hosted Events</span>
                </NavLink>
                <NavLink to="/organiser/events/create" className={navLinkClass}>
                  <PlusCircle className="w-4 h-4" />
                  <span>Host New Fest</span>
                </NavLink>
              </>
            )}
          </nav>

          {/* Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
                <div className="text-right">
                  <span className="block text-xs font-semibold text-zinc-900 max-w-[160px] truncate">
                    {user.username}
                  </span>
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                    {user.role === 'ORGANISER' ? 'Organiser' : 'Attendee'}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="text-zinc-500 hover:text-zinc-900"
                  title="Sign out"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/discover"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="w-4 h-4" />
              <span>Discover Fests</span>
            </NavLink>

            {isAuthenticated && user?.role === 'USER' && (
              <NavLink
                to="/bookings"
                className={mobileNavLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Ticket className="w-4 h-4" />
                <span>My Bookings</span>
              </NavLink>
            )}

            {isAuthenticated && user?.role === 'ORGANISER' && (
              <>
                <NavLink
                  to="/organiser/events"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Hosted Events</span>
                </NavLink>
                <NavLink
                  to="/organiser/events/create"
                  className={mobileNavLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Host New Fest</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-zinc-200">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="px-2">
                  <span className="block text-xs font-semibold text-zinc-900">
                    {user.username}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Role: {user.role === 'ORGANISER' ? 'Fest Organiser' : 'Attendee'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
