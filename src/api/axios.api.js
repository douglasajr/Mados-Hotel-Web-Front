import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
})

// Agrega el token en cada request automáticamente
api.interceptors.request.use(config => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => {
    return Promise.reject(error)
})

// Si el token expira (401) → cierra sesión y redirige al login, excepto en el
// propio login (donde un 401 significa "credenciales inválidas", no sesión vencida).
api.interceptors.response.use(
    response => response,
    error => {
      const isLoginRoute = error.config?.url?.includes('/auth/login')
  
      if (error.response?.status === 401 && !isLoginRoute) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
  
      return Promise.reject(error)
    }
  )

export default api