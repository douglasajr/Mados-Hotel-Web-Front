import GuestsListView from "../../components/guests/GuestsListView";

// "Ver huéspedes": buscar y editar en la misma pantalla.
export default function ViewGuestsPage() {
  return (
    <GuestsListView
      title="Huéspedes"
      subtitle="Busca un huésped y edítalo con el lápiz de su fila."
    />
  );
}
