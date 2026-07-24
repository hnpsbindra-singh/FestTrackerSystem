export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${suffix}`
}

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const paymentStatusLabel = (status) => {
  const map = {
    PAYMENT_PENDING: { label: 'Pending Verification', cls: 'badge badge-warning' },
    PAYMENT_SUBMITTED: { label: 'Confirmed', cls: 'badge badge-success' },
    PAYMENT_REJECTED: { label: 'Rejected', cls: 'badge badge-danger' },
  }
  return map[status] || { label: status || 'Unknown', cls: 'badge badge-muted' }
}

export const genreBadgeColor = (genre = '') => {
  const g = genre.toLowerCase()
  if (g.includes('music') || g.includes('concert')) return 'badge-primary'
  if (g.includes('tech') || g.includes('hack')) return 'badge-accent'
  if (g.includes('sports')) return 'badge-success'
  return 'badge-muted'
}

export const truncate = (str, n) => str && str.length > n ? str.slice(0, n) + '...' : str

export const INDIAN_CITIES = [
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { name: 'Bengaluru (Bangalore)', lat: 12.9716, lng: 77.5946 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Goa (Panaji)', lat: 15.4989, lng: 73.8278 },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Jammu', lat: 32.7266, lng: 74.8570 },
  { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { name: 'Kochi (Cochin)', lat: 9.9312, lng: 76.2673 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Mangaluru (Mangalore)', lat: 12.9141, lng: 74.8560 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Mysuru (Mysore)', lat: 12.2958, lng: 76.6394 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik', lat: 20.0059, lng: 73.7898 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Pondicherry (Puducherry)', lat: 11.9416, lng: 79.8083 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { name: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Thiruvananthapuram (Trivandrum)', lat: 8.5241, lng: 76.9366 },
  { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
]
