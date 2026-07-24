import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: 'https://festtrackersystem.onrender.com',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') return 'Cannot connect to server. Is the backend running?'
    return fallback
  }

  const data = error.response?.data
  if (!data) return fallback

  if (typeof data === 'string' && data.trim().length > 0) return data.trim()

  if (typeof data === 'object') {
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.detail) return data.detail
  }

  const status = error.response?.status
  if (status === 403) return 'Access denied. You may not have permission for this action.'
  if (status === 404) return 'Resource not found.'
  if (status === 500) return 'Server error. Please try again.'

  return fallback
}
