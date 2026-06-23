import api from './axios.api'

export const loginApi = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export const selectHotelApi = async (tempToken, hotelId) => {
  const { data } = await api.post('/auth/select-hotel', { tempToken, hotelId })
  return data
}

export const switchHotelApi = async () => {
  const { data } = await api.post('/auth/switch-hotel')
  return data
}