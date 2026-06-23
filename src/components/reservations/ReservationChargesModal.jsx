import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getReservationChargesApi } from '../../api/reservations.api'

const fmt = (n) => `L. ${Number(n).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`

const ISV_LABEL = {
  FOOD:      { label: 'Rest.',  cls: 'bg-orange-100 text-orange-600' },
  RECEPTION: { label: 'Pulp.', cls: 'bg-blue-100 text-blue-600' },
  EXENTO:    { label: 'Exento', cls: 'bg-gray-100 text-gray-500' },
  ROOM:      { label: 'Hosp.', cls: 'bg-purple-100 text-purple-600' },
}

export default function ReservationChargesModal({ reservationId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reservation-charges', reservationId],
    queryFn: () => getReservationChargesApi(reservationId),
  })

  const room    = data?.charges?.room
  const extras  = data?.reservationCharges ?? []

  const pendingExtras  = extras.filter((c) => !c.invoiceId)
  const billedExtras   = extras.filter((c) => !!c.invoiceId)
  const extrasTotal    = extras.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0)
  const grandTotal     = (room ? room.total : 0) + extrasTotal

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Cargos de la reservación
            {data && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                Hab. {data.room?.number} · {data.guest?.fullName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 py-1">

            {/* Hospedaje */}
            {room && (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hospedaje</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${room.billed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {room.billed ? `Facturado · ${room.invoice?.correlative ?? ''}` : 'Pendiente'}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <div>
                    <p className="text-sm text-gray-700">{room.description}</p>
                    <p className="text-xs text-gray-400">{room.nights} noche{room.nights !== 1 ? 's' : ''} × {fmt(room.pricePerNight)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 shrink-0 ml-4">{fmt(room.total)}</span>
                </div>
              </div>
            )}

            {/* Extras */}
            {extras.length > 0 && (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Extras ({extras.length})</span>
                  <div className="flex gap-1">
                    {pendingExtras.length > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{pendingExtras.length} pendiente{pendingExtras.length !== 1 ? 's' : ''}</span>
                    )}
                    {billedExtras.length > 0 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">{billedExtras.length} facturado{billedExtras.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {extras.map((c) => {
                    const badge = ISV_LABEL[c.isvType] ?? ISV_LABEL.RECEPTION
                    const lineTotal = Number(c.quantity) * Number(c.unitPrice)
                    return (
                      <div key={c.id} className="flex items-center justify-between px-3.5 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[9px] font-medium px-1.5 py-px rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-700 truncate">{c.description}</p>
                            <p className="text-[10px] text-gray-400">{c.quantity} × {fmt(c.unitPrice)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className="text-xs font-medium text-gray-800">{fmt(lineTotal)}</span>
                          {c.invoiceId ? (
                            <span className="text-[9px] text-green-600 font-medium">✓ {c.invoice?.correlative}</span>
                          ) : (
                            <span className="text-[9px] text-amber-500 font-medium">Pend.</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {extras.length === 0 && !isLoading && (
              <p className="text-xs text-gray-400 text-center py-2">Sin cargos de servicio registrados</p>
            )}

            {/* Grand total */}
            {room && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Total estancia</span>
                <span className="text-base font-bold text-gray-900">{fmt(grandTotal)}</span>
              </div>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
