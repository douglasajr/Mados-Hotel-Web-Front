import api from './axios.api'

export const getPendingCollectionApi = async () => {
  const { data } = await api.get('/cash-collections/pending')
  return data
}

export const registerCollectionApi = async (notes) => {
  const { data } = await api.post('/cash-collections', { notes })
  return data
}

export const listCollectionsApi = async (params = {}) => {
  const { data } = await api.get('/cash-collections', { params })
  return data
}

export const getCollectionDetailApi = async (id) => {
  const { data } = await api.get(`/cash-collections/${id}/detail`)
  return data
}
