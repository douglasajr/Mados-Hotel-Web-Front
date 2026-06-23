import { useState } from "react";
import { useCompanies } from "../../hooks/useCompanies";
import { Plus, Search, Building2, AlertCircle } from "lucide-react";
import CompanyModal from "../../components/companies/CompanyModal";
import CompanyTable from "../../components/companies/CompanyTable";
import CreditModal from "../../components/companies/CreditModal";
import CreditReportModal from "../../components/companies/CreditReportModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../store/auth.store";

export default function CompaniesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.role);
  const canRegisterPayment = ["SUPERADMIN", "ADMIN", "CASHIER"].includes(user?.role);
  const [modal, setModal] = useState(null);
  const [creditModal, setCreditModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [search, setSearch] = useState("");
  const [onlyDebt, setOnlyDebt] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const {
    companies,
    total,
    page,
    totalPages,
    isLoading,
    setPage,
    resetPage,
    createCompany,
    updateCompany,
    toggleStatus,
    registerPayment,
    isCreating,
    isUpdating,
  } = useCompanies({ search: debouncedSearch, hasDebt: onlyDebt || undefined });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleToggleDebt = () => {
    setOnlyDebt((v) => !v);
    resetPage();
  };

  const handleSave = async (formData) => {
    if (modal?.id) await updateCompany({ id: modal.id, ...formData });
    else await createCompany(formData);
    setModal(null);
  };

  const handlePayment = async (formData) => {
    if (!creditModal?.id) return;
    await registerPayment({ id: creditModal.id, ...formData });
    setCreditModal(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} empresa{total !== 1 ? "s" : ""} registrada{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white
                     bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                     transition-all shadow-sm"
        >
          <Plus size={16} />
          Nueva empresa
        </button>
      </div>

      {/* Buscador + filtro morosas */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nombre, RTN..."
            className="w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
          />
        </div>

        <button
          onClick={handleToggleDebt}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all
                      ${onlyDebt
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
                      }`}
        >
          <AlertCircle size={14} />
          Con deuda pendiente
          {onlyDebt && (
            <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
              activo
            </span>
          )}
        </button>
      </div>

      {/* Tabla / Loading / Empty */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {onlyDebt
              ? "No hay empresas con deuda pendiente"
              : search
              ? `No se encontraron empresas con "${search}"`
              : "No hay empresas registradas"}
          </p>
          {!search && !onlyDebt && (
            <button
              onClick={() => setModal("create")}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Registrar primera empresa
            </button>
          )}
        </div>
      ) : (
        <CompanyTable
          companies={companies}
          total={total}
          page={page}
          totalPages={totalPages}
          isAdmin={isAdmin}
          canRegisterPayment={canRegisterPayment}
          onEdit={setModal}
          onCredit={setCreditModal}
          onReport={setReportModal}
          onToggleStatus={(id, status) => toggleStatus({ id, status })}
          onPageChange={setPage}
        />
      )}

      {/* Modal crear/editar */}
      {modal && (
        <CompanyModal
          company={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}

      {/* Modal abono */}
      {creditModal && (
        <CreditModal
          company={creditModal}
          onClose={() => setCreditModal(null)}
          onSave={handlePayment}
        />
      )}

      {/* Modal reporte / estado de cuenta */}
      {reportModal && (
        <CreditReportModal
          company={reportModal}
          onClose={() => setReportModal(null)}
        />
      )}
    </div>
  );
}
