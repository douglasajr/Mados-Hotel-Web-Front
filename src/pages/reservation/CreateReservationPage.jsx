import { useState } from "react";
import { Link } from "react-router-dom";
import { useReservations } from "../../hooks/useReservations";
import { CalendarPlus, UserCheck, ArrowRight } from "lucide-react";
import ReservationModal from "../../components/reservations/ReservationModal";
import WalkInModal from "../../components/reservations/WalkinModal";

// "Crear reservación": página enfocada solo en registrar. Dos caminos:
//   - Nueva reservación (fechas futuras de entrada/salida).
//   - Venta directa / walk-in (huésped que llega y se hospeda ahora).
export default function CreateReservationPage() {
  const [modal, setModal] = useState(null);
  const { createReservation, walkIn, isCreating, isWalkingIn } = useReservations({});

  const options = [
    {
      key: "create",
      icon: CalendarPlus,
      title: "Nueva reservación",
      desc: "Con fechas futuras de entrada y salida.",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      key: "walkin",
      icon: UserCheck,
      title: "Venta directa (walk-in)",
      desc: "Huésped que llega y se hospeda ahora mismo.",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crear reservación</h1>
          <p className="text-gray-500 text-sm mt-1">Registra una reservación nueva o una venta directa.</p>
        </div>
        <Link
          to="/reservations"
          className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          Gestionar reservaciones <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {options.map(({ key, icon: Icon, title, desc, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setModal(key)}
            className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm
                       hover:border-amber-200 hover:shadow-md transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-semibold text-gray-900 flex items-center gap-1.5">
              {title}
              <ArrowRight size={15} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
            </p>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </button>
        ))}
      </div>

      {modal === "create" && (
        <ReservationModal
          onClose={() => setModal(null)}
          onSave={createReservation}
          isSaving={isCreating}
        />
      )}
      {modal === "walkin" && (
        <WalkInModal
          onClose={() => setModal(null)}
          onSave={walkIn}
          isSaving={isWalkingIn}
        />
      )}
    </div>
  );
}
