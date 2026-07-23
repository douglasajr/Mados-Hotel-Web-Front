import ReservationsListView from "../../components/reservations/ReservationsListView";

// "Gestionar reservaciones": la tabla con acciones (check-in, check-out, cargos,
// editar fechas, cancelar). Para crear está "Crear reservación" en el menú.
export default function ReservationsPage() {
  return (
    <ReservationsListView
      title="Gestionar reservaciones"
      subtitle="El movimiento de hoy: llegadas, huéspedes en hotel y salidas"
    />
  );
}
