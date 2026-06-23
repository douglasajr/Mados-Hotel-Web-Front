import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarCheck, MoreVertical, LogIn, LogOut,
  X, Receipt, CalendarDays,
} from "lucide-react";
import Pagination from "../../components/shared/Pagination";

const STATUS_CONFIG = {
  PENDING:     { label: "Pendiente",   class: "bg-gray-100 text-gray-600 hover:bg-gray-100 border-0" },
  CONFIRMED:   { label: "Confirmada",  class: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-0" },
  CHECKED_IN:  { label: "En hotel",   class: "bg-green-100 text-green-700 hover:bg-green-100 border-0" },
  CHECKED_OUT: { label: "Check-out",  class: "bg-purple-100 text-purple-700 hover:bg-purple-100 border-0" },
  CANCELLED:   { label: "Cancelada",  class: "bg-red-100 text-red-700 hover:bg-red-100 border-0" },
};

const AVATAR_COLOR = {
  PENDING:     "bg-gray-100 text-gray-600",
  CONFIRMED:   "bg-blue-100 text-blue-700",
  CHECKED_IN:  "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-purple-100 text-purple-700",
  CANCELLED:   "bg-red-100 text-red-500",
};

const fmtShort = (d) =>
  new Date(d).toLocaleDateString("es-HN", {
    day: "2-digit", month: "short", timeZone: "UTC",
  });

const calcNights = (checkIn, checkOut) =>
  Math.max(1, Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  ));

export default function ReservationTable({
  reservations,
  total,
  page,
  totalPages,
  onCheckIn,
  onCheckOut,
  onCancel,
  onPageChange,
  onViewCharges,
  onEditDates,
}) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarCheck size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No hay reservaciones</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {reservations.map((res) => {
          const nights = calcNights(res.checkIn, res.checkOut);
          const sc = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.PENDING;
          const avatarColor = AVATAR_COLOR[res.status] ?? "bg-gray-100 text-gray-600";
          const initial = res.guest?.fullName?.[0]?.toUpperCase() ?? "?";

          return (
            <div key={res.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors">

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                {initial}
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate leading-snug">
                  {res.guest?.fullName}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hab. {res.room?.number}
                  <span className="mx-1.5 text-gray-200">·</span>
                  {fmtShort(res.checkIn)} → {fmtShort(res.checkOut)}
                  <span className="mx-1.5 text-gray-200">·</span>
                  {nights}n
                </p>
              </div>

              {/* Total */}
              <p className="text-sm font-semibold text-gray-800 shrink-0 hidden sm:block">
                L.&nbsp;{Number(res.totalAmount).toLocaleString("es-HN")}
              </p>

              {/* Estado */}
              <Badge className={`text-xs shrink-0 ${sc.class}`}>{sc.label}</Badge>

              {/* Acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-gray-400 hover:text-gray-700">
                    <MoreVertical size={15} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {["CHECKED_IN", "CHECKED_OUT"].includes(res.status) && (
                    <DropdownMenuItem onClick={() => onViewCharges(res)}>
                      <Receipt size={13} className="mr-2 text-gray-400" />
                      Ver cargos
                    </DropdownMenuItem>
                  )}
                  {!["CHECKED_OUT", "CANCELLED"].includes(res.status) && (
                    <DropdownMenuItem onClick={() => onEditDates(res)}>
                      <CalendarDays size={13} className="mr-2 text-gray-400" />
                      Editar fechas
                    </DropdownMenuItem>
                  )}
                  {(res.status === "CONFIRMED" || res.status === "CHECKED_IN") && (
                    <DropdownMenuSeparator />
                  )}
                  {res.status === "CONFIRMED" && (
                    <DropdownMenuItem onClick={() => onCheckIn(res.id)}>
                      <LogIn size={13} className="mr-2 text-green-500" />
                      Hacer check-in
                    </DropdownMenuItem>
                  )}
                  {res.status === "CHECKED_IN" && (
                    <DropdownMenuItem onClick={() => onCheckOut(res)}>
                      <LogOut size={13} className="mr-2 text-purple-500" />
                      Hacer check-out
                    </DropdownMenuItem>
                  )}
                  {["PENDING", "CONFIRMED"].includes(res.status) && (
                    <DropdownMenuItem
                      onClick={() => onCancel(res.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <X size={13} className="mr-2" />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="border-t border-gray-50 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-gray-400">{total} reservaciones</p>
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
