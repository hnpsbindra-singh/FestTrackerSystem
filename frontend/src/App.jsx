import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import AuthPage from './pages/AuthPage'

import DiscoverPage from './pages/user/DiscoverPage'
import EventDetailPage from './pages/user/EventDetailPage'
import CheckoutPage from './pages/user/CheckoutPage'
import MyBookingsPage from './pages/user/MyBookingsPage'

import OrgDashboardPage from './pages/organiser/OrgDashboardPage'
import CreateEventPage from './pages/organiser/CreateEventPage'
import EventManagePage from './pages/organiser/EventManagePage'
import TicketScanPage from './pages/organiser/TicketScanPage'

import UserLayout from './components/layouts/UserLayout'
import OrgLayout from './components/layouts/OrgLayout'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
})

function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/auth" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '12px' },
            success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route path="/app" element={
            <ProtectedRoute requiredRole="USER"><UserLayout /></ProtectedRoute>
          }>
            <Route index element={<DiscoverPage />} />
            <Route path="event/:eventId" element={<EventDetailPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
          </Route>

          <Route path="/organiser" element={
            <ProtectedRoute requiredRole="ORGANISER"><OrgLayout /></ProtectedRoute>
          }>
            <Route index element={<OrgDashboardPage />} />
            <Route path="create" element={<CreateEventPage />} />
            <Route path="event/:eventId" element={<EventManagePage />} />
            <Route path="event/:eventId/scan" element={<TicketScanPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
