import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BedDouble, UtensilsCrossed, ShoppingCart,
  Loader2, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { getReservationChargesApi } from "../../api/reservations.api";
import { formatLPS } from "../../utils/invoices.constants";
import { useState } from "react";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  });

export default function CheckoutModal({ reservation, onClose, onSave, isSaving }) {
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reservation-charges", reservation.id],
    queryFn: () => getReservationChargesApi(reservation.id),
  });

  const charges = data?.charges;

  const roomBilled   = charges?.room?.billed ?? false;
  const roomTotal    = Number(reservation.totalAmount);

  const pendingOrders = (charges?.orders ?? []).filter((o) => !o.billed);
  const billedOrders  = (charges?.orders ?? []).filter((o) => o.billed);
  const pendingSales  = (charges?.receptionSales ?? []).filter((s) => !s.billed);
  const billedSales   = (charges?.receptionSales ?? []).filter((s) => s.billed);

  const totalBilled  =
    (roomBilled ? roomTotal : 0) +
    billedOrders.reduce((s, o) => s + Number(o.total), 0) +
    billedSales.reduce((s, r) => s + Number(r.total), 0);

  const totalPending =
    (roomBilled ? 0 : roomTotal) +
    pendingOrders.reduce((s, o) => s + Number(o.total), 0) +
    pendingSales.reduce((s, r) => s + Number(r.total), 0);

  const hasPending = totalPending > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al hacer check-out");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check-out — Hab. {reservation.room?.number}</DialogTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            {reservation.guest?.fullName} ·{" "}
            {fmtDate(reservation.checkIn)} → {fmtDate(reservation.checkOut)}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Resumen de cargos */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Resumen de la estadía
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Cargando cargos...
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2.5">
                {/* Habitación */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    {roomBilled
                      ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                      : <Clock size={14} className="text-amber-400 shrink-0" />}
                    <BedDouble size={14} className="text-purple-500" />
                    Habitación
                  </span>
                  <span className={`font-medium ${roomBilled ? "text-green-700" : "text-amber-700"}`}>
                    {formatLPS(roomTotal)}
                  </span>
                </div>

                {/* Restaurante */}
                {(charges?.orders?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      {pendingOrders.length === 0
                        ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        : <Clock size={14} className="text-amber-400 shrink-0" />}
                      <UtensilsCrossed size={14} className="text-orange-500" />
                      Restaurante
                      {pendingOrders.length > 0 && billedOrders.length > 0 && (
                        <span className="text-[10px] text-gray-400">
                          ({billedOrders.length} facturado{billedOrders.length !== 1 ? "s" : ""})
                        </span>
                      )}
                    </span>
                    <span className={`font-medium ${pendingOrders.length > 0 ? "text-amber-700" : "text-green-700"}`}>
                      {formatLPS(charges.orders.reduce((s, o) => s + Number(o.total), 0))}
                    </span>
                  </div>
                )}

                {/* Pulpería */}
                {(charges?.receptionSales?.length ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      {pendingSales.length === 0
                        ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        : <Clock size={14} className="text-amber-400 shrink-0" />}
                      <ShoppingCart size={14} className="text-blue-500" />
                      Pulpería
                    </span>
                    <span className={`font-medium ${pendingSales.length > 0 ? "text-amber-700" : "text-green-700"}`}>
                      {formatLPS(charges.receptionSales.reduce((s, r) => s + Number(r.total), 0))}
                    </span>
                  </div>
                )}

                {/* Totales */}
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-green-500" /> Facturado
                    </span>
                    <span className="font-semibold text-green-700">{formatLPS(totalBilled)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} className="text-amber-400" /> Pendiente de facturar
                    </span>
                    <span className="font-semibold text-amber-700">{formatLPS(totalPending)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aviso si hay pendientes */}
          {!isLoading && hasPending && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 text-amber-800 text-xs">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
              <span>
                Hay <strong>{formatLPS(totalPending)}</strong> sin facturar.
                Ve a <strong>Facturas → Nueva venta</strong> antes de hacer check-out.
              </span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0"
              disabled={isSaving}
            >
              {isSaving ? "Procesando..." : "Confirmar check-out"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
