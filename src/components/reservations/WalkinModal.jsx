import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getRoomsApi } from "../../api/rooms.api";
import { getGuestsApi } from "../../api/guests.api";
import { Search, X, Zap, BedDouble, CheckCircle2 } from "lucide-react";

const todayStr = () => new Date().toLocaleDateString("en-CA");

const ROOM_TYPE_COLORS = {
  SINGLE:  "bg-sky-50 border-sky-200 text-sky-700",
  DOUBLE:  "bg-violet-50 border-violet-200 text-violet-700",
  SUITE:   "bg-amber-50 border-amber-200 text-amber-700",
  DEFAULT: "bg-gray-50 border-gray-200 text-gray-600",
};

function RoomPicker({ rooms, value, onChange }) {
  const [roomSearch, setRoomSearch] = useState("");

  const filtered = useMemo(() => {
    const q = roomSearch.toLowerCase();
    return rooms.filter((r) =>
      r.number?.toString().includes(q) ||
      r.type?.toLowerCase().includes(q)
    );
  }, [rooms, roomSearch]);

  const selected = rooms.find((r) => r.id === value);

  if (selected) {
    const color = ROOM_TYPE_COLORS[selected.type] ?? ROOM_TYPE_COLORS.DEFAULT;
    return (
      <div className={`flex items-center justify-between border rounded-xl px-3 py-2.5 ${color}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
            <BedDouble size={15} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Habitación {selected.number}</p>
            <p className="text-xs text-gray-500">
              {selected.type} · L. {Number(selected.pricePerNight).toLocaleString("es-HN")}/noche
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-red-400 transition-colors ml-2 shrink-0"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={roomSearch}
          onChange={(e) => setRoomSearch(e.target.value)}
          placeholder="Buscar por número o tipo..."
          className="w-full pl-8 pr-3 h-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Sin habitaciones disponibles</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
          {filtered.map((room) => {
            const color = ROOM_TYPE_COLORS[room.type] ?? ROOM_TYPE_COLORS.DEFAULT;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onChange(room.id)}
                className={`flex flex-col items-start px-2.5 py-2 rounded-xl border text-left transition-all hover:scale-[1.02] hover:shadow-sm ${color}`}
              >
                <span className="text-base font-bold text-gray-800 leading-none">{room.number}</span>
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

export default function WalkInModal({ onClose, onSave, isSaving }) {
  const [form, setForm] = useState({ roomId: "", checkOut: "", notes: "" });
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [error, setError] = useState("");

  const { data: roomsData } = useQuery({
    queryKey: ["rooms", "available"],
    queryFn: () => getRoomsApi({ status: "AVAILABLE", limit: 100 }),
  });

  const { data: guestResultsData } = useQuery({
    queryKey: ["guests-search-walkin", guestSearch],
    queryFn: () => getGuestsApi({ search: guestSearch, limit: 6 }),
    enabled: !selectedGuest && guestSearch.length >= 2,
  });

  const rooms = roomsData?.data ?? [];
  const guestResults = guestResultsData?.data ?? [];

  const clearGuest = () => { setSelectedGuest(null); setGuestSearch(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedGuest || !form.roomId || !form.checkOut) {
      return setError("Huésped, habitación y fecha de salida son requeridos");
    }
    if (form.checkOut <= todayStr()) {
      return setError("La fecha de salida debe ser posterior a hoy");
    }
    try {
      await onSave({ ...form, guestId: selectedGuest.id, checkInDate: todayStr() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar walk-in");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Zap size={17} className="text-blue-500" />
            Venta directa — Entrada inmediata
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-600">
          El check-in se registra hoy. Solo indica la fecha de salida.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* Huésped */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Huésped</p>
            {selectedGuest ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-blue-500" />
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
                  className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                {guestResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {guestResults.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGuest(g)}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0 transition-colors"
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

          {/* Fecha de salida */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha de salida</p>
            <input
              type="date"
              value={form.checkOut}
              min={todayStr()}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Notas <span className="normal-case font-normal text-gray-400">(opcional)</span>
            </p>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Solicitudes especiales..."
              className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
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
              className="flex-1 h-9 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? "Registrando..." : "Registrar y hacer check-in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
