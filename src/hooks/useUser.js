import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsersApi, createUserApi, updateUserApi, toggleUserStatusApi } from '../api/users.api'
import { toast } from 'sonner'

export function useUsers() {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersApi,
  })

  const createMutation = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Usuario creado correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al crear usuario')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => updateUserApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Usuario actualizado correctamente')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Error al actualizar usuario')
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => toggleUserStatusApi(id, active),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries(['users'])
      toast.success(active ? 'Usuario activado' : 'Usuario desactivado')
    },
    onError: () => {
      toast.error('Error al cambiar estado del usuario')
    }
  })

  const handleSave = async (formData, userId) => {
    if (userId) {
      await updateMutation.mutateAsync({ id: userId, ...formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  return { users, isLoading, handleSave, toggleMutation }
}