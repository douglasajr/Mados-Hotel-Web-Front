import api from './axios.api'

export const getGuestsApi = async (params = {}) => {
  const { data } = await api.get('/guests', { params })
  return data
}

export const getGuestByIdApi = async (id) => {
  const { data } = await api.get(`/guests/${id}`)
  return data
}

export const createGuestApi = async (guestData) => {
  const { data } = await api.post('/guests', guestData)
  return data
}

export const updateGuestApi = async (id, guestData) => {
  const { data } = await api.put(`/guests/${id}`, guestData)
  return data
}