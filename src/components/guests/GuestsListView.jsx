import { useState } from "react";
import { Link } from "react-router-dom";
import { useGuests } from "../../hooks/useGuest";
import { Input } from "@/components/ui/input";
import { Search, Users, Pencil } from "lucide-react";
import GuestModal from "./GuestModal";
import GuestTable from "./GuestTable";
import { useDebounce } from "../../hooks/useDebounce";

// Lista de huéspedes. Se usa en dos modos:
//   - Gestionar (readOnly=false): permite editar cada huésped.
//   - Ver (readOnly=true): solo consulta, sin acciones.
export default function GuestsListView({ readOnly = false, title, subtitle }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const {
    guests,
    total,
    page,
    totalPages,
    isLoading,
    setPage,
    resetPage,
    updateGuest,
    isUpdating,
  } = useGuests({ search: debouncedSearch });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  // Ojo: `modal?.id` con optional chaining. El React Compiler saca esa lectura
  // fuera del callback para memoizarlo, así que se evalúa en cada render — con
  // `modal.id` reventaría mientras el modal está cerrado (modal === null).
  const handleSave = async (formData) => {
    if (!modal?.id) return;
    await updateGuest({ id: modal?.id, ...formData });
    setModal(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header — en modo consulta lleva los accesos a crear y gestionar,
          que ya no están en el menú lateral. */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {subtitle ?? `${total} huésped${total !== 1 ? "es" : ""} registrado${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Crear ya está en el menú; gestionar no, así que se entra por aquí. */}
        {readOnly && (
          <Link
            to="/guests"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                       border border-gray-200 text-gray-600 bg-white
                       hover:border-amber-300 hover:text-amber-600 transition-all"
          >
            <Pencil size={14} />
            Gestionar huéspedes
          </Link>
        )}
      </div>

      {/* Buscador */}
      <div className="relative max-w-xs">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por nombre, documento..."
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Tabla / Loading / Empty */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {search
              ? `No se encontraron huéspedes con "${search}"`
              : "No hay huéspedes registrados"}
          </p>
        </div>
      ) : (
        <GuestTable
          guests={guests}
          total={total}
          page={page}
          totalPages={totalPages}
          readOnly={readOnly}
          onEdit={setModal}
          onPageChange={setPage}
        />
      )}

      {/* Editar — solo en modo gestión */}
      {!readOnly && modal && (
        <GuestModal
          guest={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
}
