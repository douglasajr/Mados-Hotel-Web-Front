import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWarehouseStockApi,
  getWarehouseIssuesApi,
  createWarehouseIssueApi
} from '../api/warehouse.api'
import { toast } from 'sonner'

export function useWarehouseStock() {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-stock'],
    queryFn: getWarehouseStockApi
  })

  return { stock: data ?? [], isLoading }
}

export function useWarehouseIssues(filters = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-issues', filters],
    queryFn: () => getWarehouseIssuesApi(filters)
  })

  return { issues: data ?? [], isLoading }
}

export function useCreateWarehouseIssue() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createWarehouseIssueApi,
    onSuccess: () => {
      // El stock cambió, así que hay que refrescar ambas listas.
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-issues'] })
      toast.success('Salida registrada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar la salida')
    }
  })

  return {
    createIssue: mutation.mutateAsync,
    isCreating: mutation.isPending
  }
}
