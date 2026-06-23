import api from './axios.api.js'

export const getUsersApi = async () => {
  const { data } = await api.get('/users')
  return data
}

export const createUserApi = async (userData) => {
  const { data } = await api.post('/users', userData)
  return data
}

export const updateUserApi = async (id, userData) => {
  const { data } = await api.put(`/users/${id}`, userData)
  return data
}

export const toggleUserStatusApi = async (id, active) => {
  const { data } = await api.patch(`/users/${id}/status`, { active })
  return data
}