import api from './axios.api'

export const getCompaniesApi = async (params = {}) => {
  const { data } = await api.get('/companies', { params })
  return data
}

export const createCompanyApi = async (companyData) => {
  const { data } = await api.post('/companies', companyData)
  return data
}

export const updateCompanyApi = async (id, companyData) => {
  const { data } = await api.put(`/companies/${id}`, companyData)
  return data
}

export const toggleCompanyStatusApi = async (id, status) => {
  const { data } = await api.patch(`/companies/${id}/status`, { status })
  return data
}

export const getCompanyCreditApi = async (id) => {
  const { data } = await api.get(`/companies/${id}/credit`)
  return data
}

export const makeCreditPaymentApi = async (id, paymentData) => {
  const { data } = await api.post(`/companies/${id}/credit-payment`, paymentData)
  return data
}