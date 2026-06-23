import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMyShiftApi,
  listShiftsApi,
  openShiftApi,
  closeShiftApi,
  getShiftReportApi,
} from '../api/shifts.api'
import { usePagination } from './usePagination'
import { toast } from 'sonner'

export function useMyShift() {
  return useQuery({
    queryKey: ['shifts', 'my'],
    queryFn: getMyShiftApi,
  })
}

export function useShifts(filters = {}) {
  const queryClient = useQueryClient()
  const { page, limit, setPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['shifts', 'list', page, filters],
    queryFn: () => listShiftsApi({ ...filters, page, limit }),
    placeholderData: keepPreviousData,
  })

  const openMutation = useMutation({
    mutationFn: openShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Turno abierto correctamente')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al abrir turno'),
  })

  const closeMutation = useMutation({
    mutationFn: closeShiftApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Turno cerrado correctamente')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al cerrar turno'),
  })

  return {
    shifts: data?.data ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    openShift: openMutation.mutateAsync,
    closeShift: closeMutation.mutateAsync,
    isOpening: openMutation.isPending,
    isClosing: closeMutation.isPending,
  }
}

export function useShiftReport(shiftId) {
  return useQuery({
    queryKey: ['shifts', 'report', shiftId],
    queryFn: () => getShiftReportApi(shiftId),
    enabled: !!shiftId,
  })
}
