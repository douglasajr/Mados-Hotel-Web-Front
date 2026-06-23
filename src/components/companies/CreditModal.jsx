import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCompanyCreditApi } from "../../api/companies.api";
import { CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

const fmt = (n) =>
  Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2 });

const STATUS_LABEL = { CREDIT: "Crédito", OVERDUE: "Vencida" };
const STATUS_CLASS = {
  CREDIT: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default function CreditModal({ company, onClose, onSave }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    paymentDate: new Date().toLocaleDateString("en-CA"),
    reference: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["company-credit", company?.id],
    queryFn: () => getCompanyCreditApi(company.id),
    enabled: !!company?.id,
  });

  if (!company) return null;

  const invoices = data?.invoices ?? [];
  const creditUsed = Number(data?.creditUsed ?? company.creditUsed);
  const creditLimit = Number(data?.creditLimit ?? company.creditLimit);

  const handleSelect = (inv) => {
    setSelected(inv);
    setForm((f) => ({ ...f, amount: Number(inv.remainingBalance ?? inv.grandTotal).toFixed(2) }));
    setError("");
  };

  const pendingAmount = selected ? Number(selected.remainingBalance ?? selected.grandTotal) : 0;
  const isFull = selected && Number(form.amount) >= pendingAmount;

  const handleSubmit = async () => {
    setError("");
    if (!selected) return setError("Selecciona una factura");
    if (!form.amount || Number(form.amount) <= 0)
      return setError("El monto debe ser mayor a cero");
    if (Number(form.amount) > pendingAmount)
      return setError("El monto no puede superar el saldo pendiente de la factura");
    if (!form.paymentDate) return setError("La fecha es requerida");

    setSaving(true);
    try {
      await onSave({
        invoiceId: selected.id,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
        reference: form.reference,
        notes: form.notes,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar el abono");
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
        </DialogHeader>

        {/* Resumen empresa */}
        <div className="bg-[#111008] rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Empresa</p>
            <p className="text-white font-semibold">{company.name}</p>
            <p className="text-white/40 text-xs font-mono">{company.rtn}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-[0.68rem] text-white/40 mb-0.5">Deuda actual</p>
              <p className="text-red-400 font-bold text-sm">L. {fmt(creditUsed)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-[0.68rem] text-white/40 mb-0.5">Crédito disponible</p>
              <p className="text-emerald-400 font-bold text-sm">
                L. {fmt(creditLimit - creditUsed)}
              </p>
            </div>
          </div>
        </div>

        {/* Paso 1: seleccionar factura */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            1. Selecciona la factura a abonar
          </p>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">
              No hay facturas con crédito pendiente
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => {
                const isActive = selected?.id === inv.id;
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => handleSelect(inv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                                ${isActive
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/40"
                                }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${isActive ? "border-amber-500" : "border-gray-300"}`}>
                      {isActive && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {inv.correlative}
                        </span>
                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-medium ${STATUS_CLASS[inv.paymentStatus]}`}>
                          {STATUS_LABEL[inv.paymentStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Emitida: {new Date(inv.issuedAt).toLocaleDateString("es-HN")}
                        {inv.dueDate && ` · Vence: ${new Date(inv.dueDate).toLocaleDateString("es-HN")}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {inv.amountPaid > 0 && (
                        <p className="text-[0.65rem] text-gray-400 line-through">L. {fmt(inv.grandTotal)}</p>
                      )}
                      <p className="text-sm font-bold text-gray-900">
                        L. {fmt(inv.remainingBalance ?? inv.grandTotal)}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Paso 2: datos del pago — solo si hay factura seleccionada */}
        {selected && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700">2. Datos del pago</p>

            {/* Indicador pago completo / parcial */}
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                            ${isFull
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border border-amber-200 text-amber-700"
                            }`}>
              {isFull
                ? <CheckCircle2 size={15} className="shrink-0" />
                : <AlertCircle size={15} className="shrink-0" />
              }
              {isFull
                ? "Pago completo — la factura quedará saldada"
                : `Pago parcial — quedan L. ${fmt(pendingAmount - Number(form.amount || 0))} pendientes`
              }
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Monto (L.)
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, amount: pendingAmount.toFixed(2) }))}
                    className="ml-2 text-xs text-amber-600 underline"
                  >
                    total
                  </button>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={pendingAmount}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Fecha de pago</label>
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Referencia
                <span className="text-gray-400 text-xs ml-1">(cheque, transferencia)</span>
              </label>
              <input
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="No. de cheque o transferencia"
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Observaciones
                <span className="text-gray-400 text-xs ml-1">(opcional)</span>
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="..."
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 border-l-2 border-l-red-500
                              rounded-lg px-3.5 py-2.5 text-red-600 text-sm">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 border border-gray-300 rounded-xl text-sm font-medium text-gray-700
                           hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 h-10 rounded-xl text-sm font-medium text-white
                           bg-linear-to-r from-amber-500 to-orange-500
                           hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 transition-all"
              >
                {saving ? "Registrando..." : "Registrar abono"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
