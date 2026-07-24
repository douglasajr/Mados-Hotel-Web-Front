import CompaniesListView from "../../components/companies/CompaniesListView";

// "Ver empresas": buscar, editar, abonos y estado de cuenta en la misma pantalla.
export default function ViewCompaniesPage() {
  return (
    <CompaniesListView
      title="Empresas"
      subtitle="Busca una empresa y trabájala desde el menú de su fila."
    />
  );
}
