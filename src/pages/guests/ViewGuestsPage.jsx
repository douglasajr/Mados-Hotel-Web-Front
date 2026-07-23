import GuestsListView from "../../components/guests/GuestsListView";

// "Ver huéspedes": solo consulta, sin acciones de edición.
export default function ViewGuestsPage() {
  return (
    <GuestsListView
      readOnly
      title="Huéspedes"
      subtitle="Consulta de huéspedes registrados."
    />
  );
}
