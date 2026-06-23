import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices, useCreditNotes } from "../../hooks/useInvoices";
import { useAuthStore } from "../../store/auth.store";
import { useMyShift } from "../../hooks/useShifts";
import { toast } from "sonner";
import InvoiceTable from "../../components/invoices/InvoiceTable";
import VoidInvoiceModal from "../../components/invoices/VoidInvoiceModal";
import InvoiceDetailModal from "../../components/invoices/InvoicesDetailModal";
import Pagination from "../../components/shared/Pagination";
import { DOCUMENT_TYPE_LABELS, formatLPS } from "../../utils/invoices.constants";

const VOIDED_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "false", label: "Activas" },
  { value: "true", label: "Anuladas" },
];

// ── Pestaña: Facturas ────────────────────────────────────────────────────────
function InvoicesTab({ onNavigateNew }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = ["SUPERADMIN", "ADMIN"].includes(user?.role);
  const [docType, setDocType] = useState("ALL");
  const [voided, setVoided] = useState("ALL");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewInvoice, setViewInvoice] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const debounceRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  useEffect(() => { setPage(1); }, [docType, voided, dateFrom, dateTo]);

  const { invoices, total, totalPages, isLoading, voidInvoice: doVoid, isVoiding } = useInvoices({
    documentType: docType === "ALL" ? undefined : docType,
    voided: voided === "ALL" ? undefined : voided,
    page,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{total} facturas encontradas</p>
        <Button
          onClick={onNavigateNew}
          className="bg-linear-to-r from-amber-500 to-orange-500
                     hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          <Plus size={16} className="mr-2" />
          Nueva factura
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input placeholder="Correlativo o cliente..." value={search} onChange={handleSearchChange} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={docType} onValueChange={(v) => { setDocType(v); setPage(1); }}>
            <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="Tipo de documento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los documentos</SelectItem>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={voided} onValueChange={(v) => { setVoided(v); setPage(1); }}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              {VOIDED_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm w-36" />
            <span className="text-gray-400 text-xs">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-sm w-36" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-amber-600 hover:underline whitespace-nowrap">
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <InvoiceTable invoices={invoices} onView={setViewInvoice} onVoid={setVoidTarget} isAdmin={isAdmin} />
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4">
              <div className="flex items-center justify-between py-3 px-2">
                <p className="text-sm text-gray-500">{total} resultados · página {page} de {totalPages}</p>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          )}
          {invoices.length === 0 && (
            <div className="text-center py-16">
              <FileText size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron facturas</p>
            </div>
          )}
        </div>
      )}

      <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />
      <VoidInvoiceModal
        invoice={voidTarget}
        onClose={() => setVoidTarget(null)}
        onSave={async ({ id, reason }) => { await doVoid({ id, reason }); }}
        isSaving={isVoiding}
      />
    </div>
  );
}

// ── Pestaña: Notas de Crédito ────────────────────────────────────────────────
function CreditNotesTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => { setPage(1); }, [dateFrom, dateTo]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1);
    }, 400);
  };

  const { creditNotes, total, totalPages, isLoading } = useCreditNotes({
    page,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{total} nota{total !== 1 ? "s" : ""} de crédito</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input placeholder="Correlativo, cliente o motivo..." value={search} onChange={handleSearchChange} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm w-36" />
            <span className="text-gray-400 text-xs">—</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-sm w-36" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-amber-600 hover:underline whitespace-nowrap">
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {creditNotes.length === 0 ? (
            <div className="text-center py-16">
              <Receipt size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay notas de crédito registradas</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correlativo NC</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Factura original</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Motivo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {creditNotes.map((cn) => (
                    <tr key={cn.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 shrink-0">
                            <Receipt size={14} className="text-red-500" />
                          </div>
                          <span className="font-mono font-medium text-gray-900">{cn.correlative}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600 text-xs">
                        {cn.originalInvoice?.correlative ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {cn.originalInvoice?.customerName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                        <p className="truncate" title={cn.reason}>{cn.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(cn.createdAt).toLocaleDateString("es-HN")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600 whitespace-nowrap">
                        {formatLPS(cn.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="border-t border-gray-100 px-4">
                  <div className="flex items-center justify-between py-3 px-2">
                    <p className="text-sm text-gray-500">{total} notas · página {page} de {totalPages}</p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("invoices");
  const user = useAuthStore((s) => s.user);
  const { data: myShift } = useMyShift();

  const handleNavigateNew = () => {
    if (user?.role === "RECEPTIONIST" && !myShift) {
      toast.error("Debes abrir un turno antes de crear facturas");
      return;
    }
    navigate("/invoices/new");
  };

  const tabs = [
    { id: "invoices", label: "Facturas", icon: FileText },
    { id: "credit-notes", label: "Notas de Crédito", icon: Receipt },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <p className="text-gray-500 text-sm mt-1">Gestión de facturas y notas de crédito</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${tab === id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === "invoices"
        ? <InvoicesTab onNavigateNew={handleNavigateNew} />
        : <CreditNotesTab />
      }
    </div>
  );
}
