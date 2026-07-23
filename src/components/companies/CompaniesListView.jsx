import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";
import { Search, Building2, AlertCircle, Pencil } from "lucide-react";
import CompanyModal from "./CompanyModal";
import CompanyTable from "./CompanyTable";
import CreditModal from "./CreditModal";
import CreditReportModal from "./CreditReportModal";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../store/auth.store";

// Lista de empresas. Se usa en dos modos:
//   - Gestionar (readOnly=false): editar, abonos, cambio de estado.
//   - Ver (readOnly=true): solo consulta (el estado de cuenta sigue disponible
//     porque también es de lectura).
export default function CompaniesListView({ readOnly = false, title, subtitle }) {
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
    updateCompany,
    toggleStatus,
    registerPayment,
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

  // Ojo: `modal?.id` con optional chaining. El React Compiler saca esa lectura
  // fuera del callback para memoizarlo, así que se evalúa en cada render — con
  // `modal.id` reventaría mientras el modal está cerrado (modal === null).
  const handleSave = async (formData) => {
    if (!modal?.id) return;
    await updateCompany({ id: modal?.id, ...formData });
    setModal(null);
  };

  const handlePayment = async (formData) => {
    if (!creditModal?.id) return;
    await registerPayment({ id: creditModal.id, ...formData });
    setCreditModal(null);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header — en modo consulta lleva los accesos a crear y gestionar,
          que ya no están en el menú lateral. */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {subtitle ?? `${total} empresa${total !== 1 ? "s" : ""} registrada${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Crear ya está en el menú; gestionar no, así que se entra por aquí. */}
        {readOnly && (
          <Link
            to="/companies"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                       border border-gray-200 text-gray-600 bg-white
                       hover:border-amber-300 hover:text-amber-600 transition-all"
          >
            <Pencil size={14} />
            Gestionar empresas
          </Link>
        )}
      </div>

      {/* Buscador + filtro morosas */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nombre, RTN..."
            className="w-full pl-8 pr-3 h-9 text-sm border border-gray-200 rounded-lg
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
        </button>

        <span className="ml-auto self-center text-xs text-gray-400">
          {total} resultado{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla / Loading / Empty */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
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
        </div>
      ) : (
        <CompanyTable
          companies={companies}
          total={total}
          page={page}
          totalPages={totalPages}
          isAdmin={isAdmin}
          canRegisterPayment={canRegisterPayment}
          readOnly={readOnly}
          onEdit={setModal}
          onCredit={setCreditModal}
          onReport={setReportModal}
          onToggleStatus={(id, status) => toggleStatus({ id, status })}
          onPageChange={setPage}
        />
      )}

      {/* Modales de acción — solo en modo gestión */}
      {!readOnly && modal && (
        <CompanyModal
          company={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isUpdating}
        />
      )}
      {!readOnly && creditModal && (
        <CreditModal
          company={creditModal}
          onClose={() => setCreditModal(null)}
          onSave={handlePayment}
        />
      )}

      {/* Estado de cuenta: lectura, disponible en ambos modos */}
      {reportModal && (
        <CreditReportModal
          company={reportModal}
          onClose={() => setReportModal(null)}
        />
      )}
    </div>
  );
}
