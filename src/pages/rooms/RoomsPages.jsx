import { useState } from "react";
import { BedDouble, Plus, Pencil, MoreVertical, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRooms } from "../../hooks/useRoom";
import { RoomModal } from "../../components/rooms/RoomsModal";
import Pagination from "../../components/shared/Pagination";
import {
  ROOM_STATUSES,
  STATUS_CONFIG,
  TYPE_LABELS,
} from "../../utils/rooms.constants";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../store/auth.store";

export default function RoomsPage() {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const user = useAuthStore((s) => s.user);
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.role);
  // El recepcionista puede cambiar el estado de una habitación (no crear/editar/eliminar)
  const canChangeStatus = isAdmin || user?.role === "RECEPTIONIST";

  const debouncedSearch = useDebounce(search, 400);

  const {
    rooms,
    total,
    totalPages,
    page,
    isLoading,
    setPage,
    createRoom,
    updateRoom,
    toggleStatus,
    isCreating,
    isUpdating,
    stats,
  } = useRooms({
    status: filterStatus === "ALL" ? undefined : filterStatus,
    search: debouncedSearch || undefined,
  });

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSave = async (formData) => {
    if (modal?.id) await updateRoom({ id: modal.id, ...formData });
    else await createRoom(formData);
  };

  if (isLoading && !rooms.length) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habitaciones</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} habitaciones en total
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setModal("create")}
            className="bg-linear-to-r from-amber-500 to-orange-500
                       hover:from-amber-600 hover:to-orange-600 text-white border-0"
          >
            <Plus size={16} className="mr-2" />
            Nueva habitación
          </Button>
        )}
      </div>

      {/* Stats clickeables — usa stats del backend si existen, si no cuenta local */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROOM_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(filterStatus === s ? "ALL" : s)}
            className={`bg-white rounded-xl p-4 border-2 text-left transition-all shadow-sm hover:shadow-md
                        ${filterStatus === s ? "border-amber-400" : "border-gray-100"}`}
          >
            <p className="text-2xl font-bold text-gray-900">
              {stats?.[s] ?? rooms.filter((r) => r.status === s).length}
            </p>
            <Badge className={`mt-1 ${STATUS_CONFIG[s].class}`}>
              {STATUS_CONFIG[s].label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Búsqueda + filtro activo */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Buscar por número, hotel o tipo..."
            value={search}
            onChange={handleSearch}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {filterStatus !== "ALL" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtrando por:</span>
            <Badge className={STATUS_CONFIG[filterStatus].class}>
              {STATUS_CONFIG[filterStatus].label}
            </Badge>
            <button
              onClick={() => handleFilterChange("ALL")}
              className="text-xs text-amber-600 hover:underline"
            >
              Ver todas
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Habitación</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio / noche</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} className={isLoading ? "opacity-50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                      <BedDouble size={16} className="text-amber-600" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {room.number}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-gray-500">
                  {room.hotel.name}
                </TableCell>

                <TableCell className="text-sm text-gray-600">
                  {TYPE_LABELS[room.type]}
                </TableCell>

                <TableCell className="text-sm font-semibold text-gray-900">
                  L. {Number(room.pricePerNight).toLocaleString("es-HN")}
                </TableCell>

                <TableCell>
                  <Badge className={STATUS_CONFIG[room.status].class}>
                    {STATUS_CONFIG[room.status].label}
                  </Badge>
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => setModal(room)}>
                          <Pencil size={14} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {canChangeStatus && ROOM_STATUSES.filter((s) => s !== room.status).map(
                        (s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() =>
                              toggleStatus({ id: room.id, status: s })
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 inline-block
                            ${s === "AVAILABLE" ? "bg-green-500" : ""}
                            ${s === "OCCUPIED" ? "bg-blue-500" : ""}
                            ${s === "CLEANING" ? "bg-yellow-500" : ""}
                            ${s === "MAINTENANCE" ? "bg-red-500" : ""}
                          `}
                            />
                            Marcar como {STATUS_CONFIG[s].label}
                          </DropdownMenuItem>
                        ),
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty state */}
        {!isLoading && rooms.length === 0 && (
          <div className="text-center py-12">
            <BedDouble size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search || filterStatus !== "ALL"
                ? "No se encontraron habitaciones con ese criterio"
                : "No hay habitaciones registradas"}
            </p>
            {!search && filterStatus === "ALL" && (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => setModal("create")}
              >
                Crear primera habitación
              </Button>
            )}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {modal && (
        <RoomModal
          room={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
