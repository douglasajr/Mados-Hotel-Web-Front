import api from './axios.api'

export const getMyShiftApi = async () => {
  const { data } = await api.get('/shifts/my')
  return data
}

export const listShiftsApi = async (params = {}) => {
  const { data } = await api.get('/shifts', { params })
  return data
}

export const openShiftApi = async (notes) => {
  const { data } = await api.post('/shifts', { notes })
  return data
}

export const closeShiftApi = async (id) => {
  const { data } = await api.patch(`/shifts/${id}/close`)
  return data
}

export const getShiftReportApi = async (id) => {
  const { data } = await api.get(`/shifts/${id}/report`)
  return data
}
