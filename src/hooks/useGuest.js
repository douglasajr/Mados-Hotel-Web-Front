import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGuestsApi, createGuestApi, updateGuestApi } from '../api/guests.api'
import { usePagination } from './usePagination'
import { toast } from 'sonner'

export function useGuests(filters = {}) {
  const queryClient = useQueryClient()
  const { page, limit, setPage, resetPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['guests', page, filters],
    queryFn: () => getGuestsApi({ ...filters, page, limit }),
    keepPreviousData: true
  })

  const createMutation = useMutation({
    mutationFn: createGuestApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['guests'])
      toast.success('Huésped registrado correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al registrar huésped')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateGuestApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['guests'])
      toast.success('Huésped actualizado correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al actualizar huésped')
    }
  })

  return {
    guests: data?.data ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    resetPage,
    createGuest: createMutation.mutateAsync,
    updateGuest: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}