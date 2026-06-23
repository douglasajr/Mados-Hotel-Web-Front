import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenuApi, createMenuApi, updateMenuApi, toggleMenuStatusApi } from '../api/menu.api'
import { toast } from 'sonner'

export function useMenu() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['menu-items'] })

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getMenuApi
  })

  const createMutation = useMutation({
    mutationFn: createMenuApi,
    onSuccess: () => { invalidate(); toast.success('Item de menú creado') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al crear item')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateMenuApi(id, data),
    onSuccess: () => { invalidate(); toast.success('Item actualizado') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al actualizar')
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, available }) => toggleMenuStatusApi(id, available),
    onSuccess: () => { invalidate(); toast.success('Disponibilidad actualizada') },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al cambiar disponibilidad')
  })

  return {
    menuItems,
    isLoading,
    createMenuItem: createMutation.mutateAsync,
    updateMenuItem: updateMutation.mutateAsync,
    toggleAvailability: toggleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
