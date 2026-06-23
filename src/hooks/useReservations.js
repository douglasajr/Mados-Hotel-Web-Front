import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getReservationsApi, createReservationApi, walkInApi,
  checkInApi, checkOutApi, cancelReservationApi,
  updateReservationDatesApi
} from '../api/reservations.api'
import { usePagination } from './usePagination'
import { toast } from 'sonner'

export function useReservations(filters = {}) {
  const queryClient = useQueryClient()
  const { page, limit, setPage, resetPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page, filters],
    queryFn: () => getReservationsApi({ ...filters, page, limit }),
    keepPreviousData: true
  })

  const invalidate = () => queryClient.invalidateQueries(['reservations'])

  const createMutation = useMutation({
    mutationFn: createReservationApi,
    onSuccess: () => { invalidate(); toast.success('Reservación creada') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al crear reservación')
  })

  const walkInMutation = useMutation({
    mutationFn: walkInApi,
    onSuccess: () => { invalidate(); toast.success('Walk-in registrado — habitación ocupada') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al registrar walk-in')
  })

  const checkInMutation = useMutation({
    mutationFn: checkInApi,
    onSuccess: () => { invalidate(); toast.success('Check-in realizado') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al hacer check-in')
  })

  const checkOutMutation = useMutation({
    mutationFn: ({ id, ...data }) => checkOutApi(id, data),
    onSuccess: () => { invalidate(); toast.success('Check-out realizado') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al hacer check-out')
  })

  const cancelMutation = useMutation({
    mutationFn: cancelReservationApi,
    onSuccess: () => { invalidate(); toast.success('Reservación cancelada') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al cancelar')
  })

  const updateDatesMutation = useMutation({
    mutationFn: ({ id, ...dates }) => updateReservationDatesApi(id, dates),
    onSuccess: () => { invalidate(); toast.success('Fechas actualizadas') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al actualizar fechas')
  })

  return {
    reservations: data?.data ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    resetPage,
    createReservation: createMutation.mutateAsync,
    walkIn: walkInMutation.mutateAsync,
    checkIn: checkInMutation.mutate,
    checkOut: checkOutMutation.mutateAsync,
    cancelReservation: cancelMutation.mutate,
    updateDates: updateDatesMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isWalkingIn: walkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    isUpdatingDates: updateDatesMutation.isPending,
  }
}