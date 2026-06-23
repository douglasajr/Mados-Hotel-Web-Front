import api from './axios.api'

export const getReservationsApi = async (params = {}) => {
  const { data } = await api.get('/reservations', { params })
  return data
}

export const createReservationApi = async (reservationData) => {
  const { data } = await api.post('/reservations', reservationData)
  return data
}

export const walkInApi = async (walkInData) => {
  const { data } = await api.post('/reservations/walk-in', walkInData)
  return data
}

export const checkInApi = async (id) => {
  const { data } = await api.patch(`/reservations/${id}/checkin`)
  return data
}

export const checkOutApi = async (id, checkoutData) => {
  const { data } = await api.patch(`/reservations/${id}/checkout`, checkoutData)
  return data
}

export const cancelReservationApi = async (id) => {
  const { data } = await api.patch(`/reservations/${id}/cancel`)
  return data
}

export const getReservationChargesApi = async (id) => {
  const { data } = await api.get(`/reservations/${id}/charges`)
  return data
}

export const updateReservationDatesApi = async (id, dates) => {
  const { data } = await api.patch(`/reservations/${id}/dates`, dates)
  return data
}