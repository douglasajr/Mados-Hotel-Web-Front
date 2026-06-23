import { Plus } from "lucide-react";
import { formatLPS } from "../../utils/invoices.constants";

export default function InvoiceRoomTab({ filteredRooms, items, addRoomHospedaje, addRoomChargesByType }) {
  if (filteredRooms.length === 0)
    return <p className="text-center text-gray-300 text-sm py-10">No hay huéspedes hospedados</p>;

  const activeReservationId = filteredRooms.find((res) => {
    if (items.some((i) => i._key === `room-${res.id}`)) return true;
    return (res.reservationCharges ?? []).some((c) => items.some((i) => i._key === `rescharge-${c.id}`));
  })?.id ?? null;

  return (
    <div className="space-y-2">
      {filteredRooms.map((res) => {
        const rc     = res.roomCharged;
        const nights = rc?.nights ?? Math.max(1, Math.ceil((new Date(res.checkOut) - new Date(res.checkIn)) / (1000 * 60 * 60 * 24)));
        const total  = rc ? Number(rc.total) : Number(res.totalAmount);
        const billed = !!res.invoice && !res.invoice.voided;

        const pendingCharges   = (res.reservationCharges ?? []).filter((c) => !c.invoiceId);
        const pendingReception = pendingCharges.filter((c) => c.isvType === "RECEPTION");
        const pendingFood      = pendingCharges.filter((c) => c.isvType === "FOOD");
        const pendingOther     = pendingCharges.filter((c) => c.isvType !== "RECEPTION" && c.isvType !== "FOOD");

        const pulperiaTotal = pendingReception.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0);
        const foodTotal     = pendingFood.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0);
        const otherTotal    = pendingOther.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0);

        const hospedajeAdded = items.some((i) => i._key === `room-${res.id}`);
        const pulperiaAdded  = pendingReception.length > 0 && pendingReception.some((c) => items.some((i) => i._key === `rescharge-${c.id}`));
        const foodAdded      = pendingFood.length > 0 && pendingFood.some((c) => items.some((i) => i._key === `rescharge-${c.id}`));
        const otherAdded     = pendingOther.length > 0 && pendingOther.some((c) => items.some((i) => i._key === `rescharge-${c.id}`));

        const locked  = activeReservationId !== null && activeReservationId !== res.id;
        const hasRows = !billed || pendingReception.length > 0 || pendingFood.length > 0 || pendingOther.length > 0;

        return (
          <div
            key={res.id}
            className={`rounded-xl border transition-all ${
              locked ? "border-gray-100 bg-gray-50 opacity-40 select-none" : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">{res.room?.number}</span>
              <p className="text-xs font-medium text-gray-800 truncate flex-1">{res.guest?.fullName}</p>
              {billed && pendingCharges.length === 0 && (
                <span className="text-[8px] text-green-600 bg-green-50 border border-green-200 font-medium px-1.5 py-px rounded-full shrink-0">Todo facturado</span>
              )}
            </div>

            {/* Billable rows */}
            {!locked && hasRows && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">

                {/* Hospedaje */}
                {billed ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] text-gray-400">Hospedaje</p>
                      <p className="text-[10px] text-gray-300 line-through">{nights}n · {formatLPS(total)}</p>
                    </div>
                    <span className="text-[8px] text-green-600 bg-green-50 border border-green-200 font-medium px-1.5 py-px rounded-full shrink-0">Facturado ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Hospedaje</p>
                      <p className="text-[10px] text-gray-400">{nights}n · {formatLPS(total)}</p>
                    </div>
                    {hospedajeAdded ? (
                      <span className="text-[9px] text-purple-500 font-medium shrink-0">✓ Agregado</span>
                    ) : (
                      <button type="button" onClick={() => addRoomHospedaje(res)}
                        className="flex items-center gap-1 text-[10px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-2 py-1 transition-colors shrink-0">
                        <Plus size={9} />Agregar
                      </button>
                    )}
                  </div>
                )}

                {/* Pulpería */}
                {pendingReception.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Pulpería <span className="text-gray-400 font-normal">({pendingReception.length})</span></p>
                      <p className="text-[10px] font-semibold text-amber-600">{formatLPS(pulperiaTotal)}</p>
                    </div>
                    {pulperiaAdded ? (
                      <span className="text-[9px] text-amber-500 font-medium shrink-0">✓ Agregado</span>
                    ) : (
                      <button type="button" onClick={() => addRoomChargesByType(res, "RECEPTION")}
                        className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 transition-colors shrink-0">
                        <Plus size={9} />Agregar
                      </button>
                    )}
                  </div>
                )}

                {/* Comida */}
                {pendingFood.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Comida <span className="text-gray-400 font-normal">({pendingFood.length})</span></p>
                      <p className="text-[10px] font-semibold text-orange-500">{formatLPS(foodTotal)}</p>
                    </div>
                    {foodAdded ? (
                      <span className="text-[9px] text-orange-400 font-medium shrink-0">✓ Agregado</span>
                    ) : (
                      <button type="button" onClick={() => addRoomChargesByType(res, "FOOD")}
                        className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-2 py-1 transition-colors shrink-0">
                        <Plus size={9} />Agregar
                      </button>
                    )}
                  </div>
                )}

                {/* Otros */}
                {pendingOther.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Otros <span className="text-gray-400 font-normal">({pendingOther.length})</span></p>
                      <p className="text-[10px] font-semibold text-gray-600">{formatLPS(otherTotal)}</p>
                    </div>
                    {otherAdded ? (
                      <span className="text-[9px] text-gray-400 font-medium shrink-0">✓ Agregado</span>
                    ) : (
                      <button type="button"
                        onClick={() => [...new Set(pendingOther.map((c) => c.isvType))].forEach((t) => addRoomChargesByType(res, t))}
                        className="flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 transition-colors shrink-0">
                        <Plus size={9} />Agregar
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
