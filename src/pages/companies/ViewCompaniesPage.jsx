import CompaniesListView from "../../components/companies/CompaniesListView";

// "Ver empresas": solo consulta (incluye estado de cuenta, que es de lectura).
export default function ViewCompaniesPage() {
  return (
    <CompaniesListView
      readOnly
      title="Empresas"
      subtitle="Consulta de empresas y su estado de crédito."
    />
  );
}
