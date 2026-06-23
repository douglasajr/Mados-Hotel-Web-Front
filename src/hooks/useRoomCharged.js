import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getRoomChargesApi, updateRoomChargeApi } from "../api/roomCharged.api"

export function useRoomCharged(params = {}) {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["room-charges", params],
    queryFn: () => getRoomChargesApi(params),
  })

  const { mutateAsync: updateCharge, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, body }) => updateRoomChargeApi(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room-charges"] })
      qc.invalidateQueries({ queryKey: ["checked-in-guests"] })
      qc.invalidateQueries({ queryKey: ["reservations"] })
      toast.success("Cargo actualizado")
    },
    onError: (e) => toast.error(e.response?.data?.error ?? "Error al actualizar"),
  })

  return {
    charges: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    updateCharge,
    isUpdating,
  }
}
