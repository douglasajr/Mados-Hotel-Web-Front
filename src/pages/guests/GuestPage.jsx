import { useState } from "react";
import { useGuests } from "../../hooks/useGuest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Users } from "lucide-react";
import GuestModal from "../../components/guests/GuestModal";
import GuestTable from "../../components/guests/GuestTable";
import { useDebounce } from "../../hooks/useDebounce";

export default function GuestsPage() {
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
    createGuest,
    updateGuest,
    isCreating,
    isUpdating,
  } = useGuests({ search: debouncedSearch });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleSave = async (formData) => {
    if (modal?.id) await updateGuest({ id: modal.id, ...formData });
    else await createGuest(formData);
    setModal(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Huéspedes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} huéspedes registrados
          </p>
        </div>
        <Button
          onClick={() => setModal("create")}
          className="bg-linear-to-r from-amber-500 to-orange-500
                     hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          <UserPlus size={16} className="mr-2" />
          Nuevo huésped
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por nombre, documento..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Tabla / Loading / Empty */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {search
              ? `No se encontraron huéspedes con "${search}"`
              : "No hay huéspedes registrados"}
          </p>
          {!search && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setModal("create")}
            >
              Registrar primer huésped
            </Button>
          )}
        </div>
      ) : (
        <GuestTable
          guests={guests}
          total={total}
          page={page}
          totalPages={totalPages}
          onEdit={setModal}
          onPageChange={setPage}
        />
      )}

      {/* Modal */}
      {modal && (
        <GuestModal
          guest={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
