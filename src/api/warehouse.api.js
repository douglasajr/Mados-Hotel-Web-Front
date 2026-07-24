import api from './axios.api'

export const getWarehouseStockApi = async () => {
  const { data } = await api.get('/warehouse/stock')
  return data.data
}

export const getWarehouseIssuesApi = async (params = {}) => {
  const { data } = await api.get('/warehouse/issues', { params })
  return data.data
}

export const createWarehouseIssueApi = async (issueData) => {
  const { data } = await api.post('/warehouse/issues', issueData)
  return data.data
}
