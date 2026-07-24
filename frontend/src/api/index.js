import api from './axios'

export const register = (data) => api.post('/api/auth/register', data)
export const verifyOtp = (data) => api.post('/api/auth/verify-otp', data)
export const login = (data) => api.post('/api/auth/login', data)
export const sendOtp = (username) => api.post(`/api/auth/send-otp?username=${encodeURIComponent(username)}`)
export const resetPassword = (data) => api.put('/api/auth/verify-otp', data)

export const findNearbyEvents = (latitude, longitude, radius, page = 0, size = 12) =>
  api.get('/api/user/find-Events-Nearby', { params: { latitude, longitude, radius, page, size } })

export const getEventDetails = (eventId) => api.get(`/api/user/events/${eventId}`)
export const getEventSeating = (eventId) => api.get(`/api/user/events/${eventId}/seating`)
export const initiateBooking = (data) => api.post('/api/user/bookings/initiate', data)
export const confirmBooking = (bookingId, data) => api.post(`/api/user/bookings/${bookingId}/confirm`, data)
export const getMyBookings = (page = 0, size = 10) => api.get('/api/user/bookings', { params: { page, size } })

export const addEvent = (festData, paymentQrFile) => {
  const formData = new FormData()
  formData.append('fest', new Blob([JSON.stringify(festData)], { type: 'application/json' }))
  formData.append('paymentQr', paymentQrFile)
  return api.post('/api/organiser/addEvent', formData)
}
export const getMyEvents = () => api.get('/api/organiser/view-my-events')
export const getMyEventDetails = (eventId) => api.get(`/api/organiser/view-my-events/${eventId}`)
export const getMyEventSeats = (eventId) => api.get(`/api/organiser/view-my-events/${eventId}/seats`)
export const getMyEventBookings = (eventId, page = 0, size = 10) =>
  api.get(`/api/organiser/view-my-events/${eventId}/bookings`, { params: { page, size } })
export const declineTicket = (eventId, bookingId) =>
  api.patch(`/api/organiser/view-my-events/${eventId}/${bookingId}/decline`)
export const cancelEvent = (eventId) => api.patch(`/api/organiser/view-my-events/${eventId}/cancel`)
export const verifyTicket = (eventId, bookingKey) =>
  api.get(`/api/organiser/view-my-events/${eventId}/verify/${bookingKey}`)
