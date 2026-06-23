import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getRoomsApi } from "../../api/rooms.api";
import { getGuestsApi } from "../../api/guests.api";
import { Search, X, CalendarDays, CheckCircle2 } from "lucide-react";

const ROOM_TYPE_COLORS = {
  SINGLE:  "bg-sky-50 border-sky-200",
  DOUBLE:  "bg-violet-50 border-violet-200",
  SUITE:   "bg-amber-50 border-amber-200",
  DEFAULT: "bg-gray-50 border-gray-200",
};

const STATUS_CONFIG = {
  AVAILABLE:   { label: "Disponible", cls: "bg-green-100 text-green-700 border-green-200" },
  OCCUPIED:    { label: "Ocupada",    cls: "bg-amber-100 text-amber-700 border-amber-200" },
  CLEANING:    { label: "Limpieza",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  MAINTENANCE: { label: "Mant.",      cls: "bg-red-100 text-red-700 border-red-200" },
};

function RoomPicker({ rooms, value, onChange }) {
  const [roomSearch, setRoomSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const filtered = useMemo(() => {
    const q = roomSearch.toLowerCase();
    return rooms.filter((r) => {
      if (onlyAvailable && r.status !== "AVAILABLE") return false;
      return !q || r.number?.toString().includes(q) || r.type?.toLowerCase().includes(q);
    });
  }, [rooms, roomSearch, onlyAvailable]);

  const selected = rooms.find((r) => r.id === value);

  if (selected) {
    const color = ROOM_TYPE_COLORS[selected.type] ?? ROOM_TYPE_COLORS.DEFAULT;
    const status = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.AVAILABLE;
    return (
      <div className={`flex items-center justify-between border rounded-xl px-3 py-2.5 ${color}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0 text-sm font-bold text-gray-700">
            {selected.number}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-800">Habitación {selected.number}</p>
              <span className={`text-[9px] font-medium px-1.5 py-px rounded-full border ${status.cls}`}>{status.label}</span>
            </div>
            <p className="text-xs text-gray-500">
              {selected.type} · L. {Number(selected.pricePerNight).toLocaleString("es-HN")}/noche
            </p>
          </div>
        </div>
        <button type="button" onClick={() => onChange("")} className="text-gray-400 hover:text-red-400 transition-colors ml-2 shrink-0">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder="Buscar por número o tipo..."
            className="w-full pl-8 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
          />
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-500 whitespace-nowrap cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-3.5 h-3.5 accent-amber-500"
          />
          Solo disponibles
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          {onlyAvailable ? "No hay habitaciones disponibles" : "Sin resultados"}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
          {filtered.map((room) => {
            const color  = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.DEFAULT;
            const status = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.AVAILABLE;
            const unavailable = room.status !== "AVAILABLE";
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onChange(room.id)}
                className={`flex flex-col items-start px-2.5 py-2 rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-sm ${color} ${unavailable ? "opacity-70" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base font-bold text-gray-800 leading-none">{room.number}</span>
                  {unavailable && (
                    <span className={`text-[8px] font-medium px-1 py-px rounded-full border leading-none ${status.cls}`}>{status.label}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 truncate w-full">{room.type}</span>
                <span className="text-[10px] font-medium text-gray-600 mt-1">
                  L.{Number(room.pricePerNight).toLocaleString("es-HN")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReservationModal({ onClose, onSave, isSaving }) {
  const [form, setForm] = useState({ roomId: "", checkIn: "", checkOut: "", notes: "" });
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [error, setError] = useState("");

  const { data: roomsData } = useQuery({
    queryKey: ["rooms", "all"],
    queryFn: () => getRoomsApi({ limit: 100 }),
  });

  const { data: guestResultsData } = useQuery({
    queryKey: ["guests-search-res", guestSearch],
    queryFn: () => getGuestsApi({ search: guestSearch, limit: 6 }),
    enabled: !selectedGuest && guestSearch.length >= 2,
  });

  const rooms = roomsData?.data ?? [];
  const guestResults = guestResultsData?.data ?? [];

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    return Math.max(0, Math.ceil(
      (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)
    ));
  }, [form.checkIn, form.checkOut]);

  const selectedRoom = rooms.find((r) => r.id === form.roomId);
  const estimatedTotal = selectedRoom && nights > 0
    ? Number(selectedRoom.pricePerNight) * nights
    : null;

  const clearGuest = () => { setSelectedGuest(null); setGuestSearch(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedGuest || !form.roomId || !form.checkIn || !form.checkOut) {
      return setError("Todos los campos son requeridos");
    }
    if (form.checkOut <= form.checkIn) {
      return setError("La fecha de salida debe ser posterior a la de entrada");
    }
    try {
      await onSave({ ...form, guestId: selectedGuest.id });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarDays size={17} className="text-amber-500" />
            Nueva Reservación
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* Huésped */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Huésped</p>
            {selectedGuest ? (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selectedGuest.fullName}</p>
                    {selectedGuest.documentId && (
                      <p className="text-xs text-gray-400">{selectedGuest.documentId}</p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={clearGuest} className="text-gray-300 hover:text-red-400 transition-colors ml-2">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar por nombre o documento..."
                  className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                {guestResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {guestResults.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGuest(g)}
                        className="w-full text-left px-3 py-2.5 hover:bg-amber-50 text-sm border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{g.fullName}</p>
                        {g.documentId && <p className="text-xs text-gray-400">{g.documentId}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {guestSearch.length >= 2 && guestResults.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2.5 text-sm text-gray-400">
                    Sin resultados
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Habitación */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Habitación</p>
            <RoomPicker
              rooms={rooms}
              value={form.roomId}
              onChange={(val) => setForm({ ...form, roomId: val })}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entrada</p>
              <input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salida</p>
              <input
                type="date"
                value={form.checkOut}
                min={form.checkIn || undefined}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Resumen */}
          {estimatedTotal !== null && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {nights} noche{nights !== 1 ? "s" : ""} · {selectedRoom.type}
              </p>
              <p className="text-sm font-bold text-gray-900">
                L. {estimatedTotal.toLocaleString("es-HN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notas <span className="normal-case font-normal text-gray-400">(opcional)</span>
            </p>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Solicitudes especiales..."
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-9 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Crear reservación"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
