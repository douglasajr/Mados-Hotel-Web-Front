import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Persist the auth store in localStorage
export const useAuthStore = create(
    persist(
      (set) => ({
        token: null,
        user: null,
        hotels: null,
        tempToken: null,
  
        setLogin: (data) => set({
          token: data.token,
          user: data.user
        }),

        setTempToken: (tempToken, hotels) => set({
          tempToken,
          hotels
        }),

        setSelectedHotel: (token, user) => set({
          token,
          user,
          tempToken: null,
          hotels: null
        }),

        // Guarda el tempToken sin borrar el token principal
        // (PrivateRoute no redirige al login mientras navega a /select-hotel)
        prepareHotelSwitch: (tempToken, hotels) => set({ tempToken, hotels }),

        logout: () => set({
          token: null,
          user: null,
          hotels: null,
          tempToken: null
        })
      }),
      {
        name: 'mados-auth'  // se guarda en localStorage
      }
    )
  )