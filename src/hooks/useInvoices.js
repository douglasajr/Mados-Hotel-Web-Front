import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvoicesApi, voidInvoiceApi, createInvoiceApi, getCreditNotesApi } from '../api/invoices.api'
import { toast } from 'sonner'

export function useInvoices(filters = {}) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => getInvoicesApi(filters),
    placeholderData: keepPreviousData,
  })

  const createMutation = useMutation({
    mutationFn: createInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Factura generada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al generar factura')
    }
  })

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }) => voidInvoiceApi(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Factura anulada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al anular factura')
    }
  })

  return {
    invoices: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    currentPage: data?.page ?? 1,
    isLoading,
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    voidInvoice: voidMutation.mutateAsync,
    isVoiding: voidMutation.isPending,
  }
}

export function useCreditNotes(filters = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ['credit-notes', filters],
    queryFn: () => getCreditNotesApi(filters),
    placeholderData: keepPreviousData,
  })

  return {
    creditNotes: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
  }
}