import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type BusinessSector = 'restaurant' | 'commerce' | 'services' | 'hospitality'

export interface User {
  id: string
  firstName: string
  lastName: string
  phone: string
  businessName: string
  businessSector: BusinessSector
  isAuthenticated: boolean
  onboardingComplete?: boolean
  whatsappSettings?: {
    autoReply: boolean
  }
  assistantSettings?: {
    style: 'poli' | 'energique' | 'pro'
    language: 'fr' | 'en' | 'auto'
    useTu: boolean
  }
}

interface UserState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () => set({ user: null }),
      isAuthenticated: () => {
        const user = get().user
        return user ? user.isAuthenticated : false
      },
    }),
    {
      name: 'whalix-user-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)