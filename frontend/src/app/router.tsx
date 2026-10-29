import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { EventDetailsPage } from '@/pages/EventDetailsPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { OrganiserDashboardPage } from '@/pages/organiser/OrganiserDashboardPage';
import { CreateEventPage } from '@/pages/organiser/CreateEventPage';
import { OrganiserEventDetailPage } from '@/pages/organiser/OrganiserEventDetailPage';
import { TicketVerifyPage } from '@/pages/organiser/TicketVerifyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Auth Guard for routes requiring a logged-in user
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRole?: 'USER' | 'ORGANISER' }> = ({
  children,
  allowedRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // If an organiser visits attendee-only bookings, or vice-versa
    if (user?.role === 'ORGANISER') {
      return <Navigate to="/organiser/events" replace />;
    } else {
      return <Navigate to="/discover" replace />;
    }
  }

  return <>{children}</>;
};

// Redirect logged-in users away from auth pages
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <Navigate
        to={user.role === 'ORGANISER' ? '/organiser/events' : '/discover'}
        replace
      />
    );
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailsPage />,
      },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute allowedRole="USER">
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      // Organiser Portal Routes
      {
        path: 'organiser/events',
        element: (
          <ProtectedRoute allowedRole="ORGANISER">
            <OrganiserDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organiser/events/create',
        element: (
          <ProtectedRoute allowedRole="ORGANISER">
            <CreateEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organiser/events/:id',
        element: (
          <ProtectedRoute allowedRole="ORGANISER">
            <OrganiserEventDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organiser/events/:id/verify',
        element: (
          <ProtectedRoute allowedRole="ORGANISER">
            <TicketVerifyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
