import api from './axios.api.js'

export const getFiscalConfigsApi = async () => {
  const { data } = await api.get('/fiscal-config')
  return data
}

export const getActiveFiscalConfigApi = async () => {
  const { data } = await api.get('/fiscal-config/active')
  return data
}

export const createFiscalConfigApi = async (payload) => {
  const { data } = await api.post('/fiscal-config', payload)
  return data
}

export const updateFiscalConfigApi = async (id, payload) => {
  const { data } = await api.put(`/fiscal-config/${id}`, payload)
  return data
}
