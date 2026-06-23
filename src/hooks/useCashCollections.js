import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPendingCollectionApi,
  registerCollectionApi,
  listCollectionsApi,
  getCollectionDetailApi,
} from '../api/cashCollections.api'
import { usePagination } from './usePagination'
import { toast } from 'sonner'

export function usePendingCollection() {
  return useQuery({
    queryKey: ['cash-collections', 'pending'],
    queryFn: getPendingCollectionApi,
  })
}

export function useCashCollections() {
  const queryClient = useQueryClient()
  const { page, limit, setPage } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['cash-collections', 'list', page],
    queryFn: () => listCollectionsApi({ page, limit }),
    placeholderData: keepPreviousData,
  })

  const registerMutation = useMutation({
    mutationFn: registerCollectionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-collections'] })
      toast.success('Recolección registrada correctamente')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al registrar recolección'),
  })

  return {
    collections: data?.data ?? [],
    total: data?.total ?? 0,
    page,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    setPage,
    registerCollection: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
  }
}

export function useCollectionDetail(collectionId) {
  return useQuery({
    queryKey: ['cash-collections', 'detail', collectionId],
    queryFn: () => getCollectionDetailApi(collectionId),
    enabled: !!collectionId,
  })
}
