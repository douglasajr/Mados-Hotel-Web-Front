import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getReservationChargesApi,
  addReservationChargeApi,
  updateReservationChargeApi,
  deleteReservationChargeApi,
} from "../api/reservationCharges.api"

export function useReservationCharges(reservationId) {
  const qc = useQueryClient()
  const key = ["reservation-charges", reservationId]

  const { data: charges = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => getReservationChargesApi(reservationId),
    enabled: !!reservationId,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: key })
    qc.invalidateQueries({ queryKey: ["checked-in-guests"] })
  }

  const { mutateAsync: addCharge, isPending: isAdding } = useMutation({
    mutationFn: addReservationChargeApi,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          description: variables.description,
          quantity: variables.quantity,
          unitPrice: variables.unitPrice,
          isvType: variables.isvType,
          productId: variables.productId ?? null,
          createdAt: new Date().toISOString(),
        },
      ])
      return { prev }
    },
    onError: (e, _, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev)
      toast.error(e.response?.data?.error ?? "Error al agregar")
    },
    onSettled: invalidate,
  })

  const { mutateAsync: updateCharge, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, body }) => updateReservationChargeApi(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...body } : c))
      )
      return { prev }
    },
    onError: (e, _, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev)
      toast.error(e.response?.data?.error ?? "Error al actualizar")
    },
    onSettled: invalidate,
  })

  const { mutateAsync: removeCharge, isPending: isRemoving } = useMutation({
    mutationFn: deleteReservationChargeApi,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old = []) => old.filter((c) => c.id !== id))
      return { prev }
    },
    onError: (e, _, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev)
      toast.error(e.response?.data?.error ?? "Error al eliminar")
    },
    onSettled: invalidate,
  })

  const total = charges.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0)

  return { charges, isLoading, total, addCharge, isAdding, updateCharge, isUpdating, removeCharge, isRemoving }
}
