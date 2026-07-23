import ReservationsListView from "../../components/reservations/ReservationsListView";

// "Ver reservaciones": solo consulta (buscar, filtrar, ver). Sin acciones.
export default function ViewReservationsPage() {
  return (
    <ReservationsListView
      readOnly
      title="Ver reservaciones"
      subtitle="Consulta de reservaciones (solo lectura)"
    />
  );
}
