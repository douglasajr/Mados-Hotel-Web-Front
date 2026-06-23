import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCompaniesApi, createCompanyApi,
  updateCompanyApi, toggleCompanyStatusApi,
  makeCreditPaymentApi
} from '../api/companies.api'
import { usePagination } from './usePagination'
import { toast } from 'sonner'

export function useCompanies(filters = {}) {
  const queryClient = useQueryClient()
  const { page, limit, setPage, resetPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['companies', page, filters],
    queryFn: () => getCompaniesApi({ ...filters, page, limit }),
    placeholderData: keepPreviousData
  })

  const createMutation = useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('Empresa registrada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar empresa')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateCompanyApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('Empresa actualizada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al actualizar empresa')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => toggleCompanyStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('Estado actualizado')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al cambiar estado')
    }
  })

  const creditPaymentMutation = useMutation({
    mutationFn: ({ id, ...data }) => makeCreditPaymentApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('Pago registrado correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar pago')
    }
  })

  return {
    companies: data?.data ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    resetPage,
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    toggleStatus: toggleMutation.mutate,
    registerPayment: creditPaymentMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}