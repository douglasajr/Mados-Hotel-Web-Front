import { useState } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";
import { Building2, ArrowRight, Check } from "lucide-react";
import CompanyModal from "../../components/companies/CompanyModal";

// "Crear empresa": página enfocada solo en registrar. El formulario se abre de
// una vez al entrar; si se cierra, queda la tarjeta para volver a abrirlo.
export default function CreateCompanyPage() {
  const [open, setOpen] = useState(true);
  const [lastCreated, setLastCreated] = useState(null);
  const { createCompany, isCreating } = useCompanies({});

  const handleSave = async (formData) => {
    await createCompany(formData);
    setLastCreated(formData.name);
    setOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crear empresa</h1>
          <p className="text-gray-500 text-sm mt-1">Registra una empresa nueva y su línea de crédito.</p>
        </div>
        <Link
          to="/companies"
          className="text-sm text-gray-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          Gestionar empresas <ArrowRight size={14} />
        </Link>
      </div>

      {lastCreated && (
        <div className="mb-4 max-w-md flex items-center gap-2.5 bg-green-50 border border-green-200
                        rounded-xl px-4 py-3 text-sm text-green-700">
          <Check size={16} className="shrink-0" />
          <span><strong>{lastCreated}</strong> se registró correctamente.</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm w-full max-w-md
                   hover:border-amber-200 hover:shadow-md transition-all group"
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center border mb-3
                        text-blue-600 bg-blue-50 border-blue-100">
          <Building2 size={20} />
        </div>
        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
          {lastCreated ? "Registrar otra empresa" : "Nueva empresa"}
          <ArrowRight size={15} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </p>
        <p className="text-sm text-gray-500 mt-1">Nombre, RTN, contacto y crédito.</p>
      </button>

      {open && (
        <CompanyModal
          onClose={() => setOpen(false)}
          onSave={handleSave}
          isSaving={isCreating}
        />
      )}
    </div>
  );
}
