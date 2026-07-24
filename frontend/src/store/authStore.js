import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function parseJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return {}
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      username: null,
      role: null,
      setAuth: (token) => {
        const payload = parseJwt(token)
        const username = payload.sub ?? ''
        const rawRole = (payload.role ?? payload.roles ?? '').toString()
        const role = rawRole.replace('ROLE_', '') || null
        set({ token, username, role })
      },
      logout: () => set({ token: null, username: null, role: null }),
    }),
    { name: 'fest-auth' }
  )
)
