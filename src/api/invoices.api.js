import api from './axios.api'

export const getInvoicesApi = async (filters = {}) => {
  const { data } = await api.get('/invoices', { params: filters })
  return data
}

export const getInvoiceByIdApi = async (id) => {
  const { data } = await api.get(`/invoices/${id}`)
  return data
}

export const voidInvoiceApi = async (id, reason) => {
  const { data } = await api.patch(`/invoices/${id}/void`, { reason })
  return data
}

export const createInvoiceApi = async (payload) => {
  const { data } = await api.post('/invoices', payload)
  return data
}

export const getCreditNotesApi = async (filters = {}) => {
  const { data } = await api.get('/invoices/credit-notes', { params: filters })
  return data
}

