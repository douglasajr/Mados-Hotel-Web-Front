import { useState } from 'react'
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoomsApi, createRoomApi, updateRoomApi, toggleRoomStatusApi } from '../api/rooms.api'
import { toast } from 'sonner'

const statusToast = (status) => {
  const messages = {
    AVAILABLE: () => toast.success('Habitación disponible'),
    OCCUPIED: () => toast.error('Habitación ocupada'),
    CLEANING: () => toast.info('Habitación en limpieza'),
    MAINTENANCE: () => toast.warning('Habitación en mantenimiento'),
  }
  messages[status]?.()
}

export function useRooms(filters = {}) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', page, filters],
    queryFn: () => getRoomsApi({ ...filters, page, limit }),
    placeholderData: keepPreviousData
  })

  const createMutation = useMutation({
    mutationFn: createRoomApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms'])
      toast.success('Habitación creada correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al crear habitación')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateRoomApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms'])
      toast.success('Habitación actualizada con éxito')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al actualizar habitación')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => toggleRoomStatusApi(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries(['rooms'])
      statusToast(status)
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al cambiar estado')
    }
  })

  return {
    rooms: data?.data ?? [],
    total: data?.total ?? 0,
    stats: data?.stats ?? null,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    createRoom: createMutation.mutateAsync,
    updateRoom: updateMutation.mutateAsync,
    toggleStatus: toggleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}