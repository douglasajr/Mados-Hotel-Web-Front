import { useState } from "react";
import { Link } from "react-router-dom";
import { useGuests } from "../../hooks/useGuest";
import { UserPlus, ArrowRight, Check } from "lucide-react";
import GuestModal from "../../components/guests/GuestModal";

// "Crear huésped": página enfocada solo en registrar. El formulario se abre de
// una vez al entrar; si se cierra, queda la tarjeta para volver a abrirlo.
export default function CreateGuestPage() {
  const [open, setOpen] = useState(true);
  const [lastCreated, setLastCreated] = useState(null);
  const { createGuest, isCreating } = useGuests({});

  const handleSave = async (formData) => {
    await createGuest(formData);
    setLastCreated(formData.fullName);
    setOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crear huésped</h1>
          <p className="text-gray-500 text-sm mt-1">Registra un huésped nuevo en el sistema.</p>
        </div>
        <Link
          to="/guests"
          className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          Ver huéspedes <ArrowRight size={14} />
        </Link>
      </div>

      {lastCreated && (
        <div className="mb-4 max-w-md flex items-center gap-2.5 bg-green-50 border border-green-200
                        rounded-xl px-4 py-3 text-sm text-green-700">
          <Check size={16} className="shrink-0" />
          <span><strong>{lastCreated}</strong> se registró correctamente.</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm w-full max-w-md
                   hover:border-amber-200 hover:shadow-md transition-all group"
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center border mb-3
                        text-amber-600 bg-amber-50 border-amber-100">
          <UserPlus size={20} />
        </div>
        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
          {lastCreated ? "Registrar otro huésped" : "Nuevo huésped"}
          <ArrowRight size={15} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </p>
        <p className="text-sm text-gray-500 mt-1">Nombre, documento, RTN, contacto y empresa.</p>
      </button>

      {open && (
        <GuestModal
          onClose={() => setOpen(false)}
          onSave={handleSave}
          isSaving={isCreating}
        />
      )}
    </div>
  );
}
