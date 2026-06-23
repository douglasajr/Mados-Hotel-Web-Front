import api from './axios.api'

export const getSarReportsApi = async () => {
  const { data } = await api.get('/sar-reports')
  return data
}

export const generateSarReportApi = async ({ periodStart, periodEnd }) => {
  const { data } = await api.get('/sar-reports/generate', {
    params: { periodStart, periodEnd },
  })
  return data
}
