import CompaniesListView from "../../components/companies/CompaniesListView";

// "Gestionar empresas": lista con acciones (editar, abonos, estado).
export default function CompaniesPage() {
  return (
    <CompaniesListView
      title="Gestionar empresas"
      subtitle="Edita empresas, registra abonos y controla el crédito."
    />
  );
}
