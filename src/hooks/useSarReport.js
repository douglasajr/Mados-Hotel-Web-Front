import { useState } from 'react'
import { generateSarReportApi } from '../api/sarReport.api'
import { toast } from 'sonner'

export function useSarReport() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState(null)

  const generateReport = async ({ periodStart, periodEnd }) => {
    setIsGenerating(true)
    try {
      const result = await generateSarReportApi({ periodStart, periodEnd })
      setGeneratedReport(result)
      toast.success('Reporte SAR generado correctamente')
      return result
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al generar el reporte')
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateReport,
    isGenerating,
    generatedReport,
    clearReport: () => setGeneratedReport(null),
  }
}
