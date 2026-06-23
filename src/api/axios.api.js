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

// Si el token expira → redirige al login
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.status === 401) {
//       useAuthStore.getState().logout()
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

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