import api from './axios.api.js'

export const getDashboardApi = async () => {
  const { data } = await api.get('/dashboard')
  return data
}