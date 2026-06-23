import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCompanyCreditApi } from "../../api/companies.api";
import { Printer, Building2 } from "lucide-react";

const fmt = (n) =>
  Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2 });

const STATUS_LABEL = { CREDIT: "Crédito", OVERDUE: "Vencida", PAID: "Pagada" };
const STATUS_CLASS = {
  CREDIT: "bg-blue-100 text-blue-700",
  OVERDUE: "bg-red-100 text-red-700",
  PAID: "bg-green-100 text-green-700",
};

export default function CreditReportModal({ company, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["company-credit", company?.id],
    queryFn: () => getCompanyCreditApi(company.id),
    enabled: !!company?.id,
  });

  if (!company) return null;

  const invoices = data?.invoices ?? [];
  const payments = data?.creditPayments ?? [];
  const creditUsed = Number(data?.creditUsed ?? company.creditUsed);
  const creditLimit = Number(data?.creditLimit ?? company.creditLimit);

  const today = new Date().toLocaleDateString("es-HN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const handlePrint = () => {
    const printArea = document.getElementById("credit-report-print");
    const original = document.body.innerHTML;
    document.body.innerHTML = printArea.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Estado de Cuenta</DialogTitle>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200
                         text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Printer size={14} />
              Imprimir
            </button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div id="credit-report-print" className="space-y-6">
            {/* Encabezado del reporte */}
            <div className="bg-[#111008] rounded-xl p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Building2 size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{company.name}</p>
                    <p className="text-white/50 text-xs font-mono mt-0.5">{company.rtn}</p>
                    {company.address && (
                      <p className="text-white/40 text-xs mt-0.5">{company.address}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/40 uppercase tracking-widest">Estado de cuenta</p>
                  <p className="text-xs text-white/40 mt-0.5">{today}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[0.68rem] text-white/40 mb-0.5 uppercase tracking-wide">Límite de crédito</p>
                  <p className="font-bold text-white">L. {fmt(creditLimit)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[0.68rem] text-white/40 mb-0.5 uppercase tracking-wide">Saldo pendiente</p>
                  <p className="font-bold text-red-400">L. {fmt(creditUsed)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-[0.68rem] text-white/40 mb-0.5 uppercase tracking-wide">Crédito disponible</p>
                  <p className="font-bold text-emerald-400">L. {fmt(creditLimit - creditUsed)}</p>
                </div>
              </div>
            </div>

            {/* Facturas pendientes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Facturas con saldo pendiente
              </h3>
              {invoices.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-sm">No hay facturas pendientes</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correlativo</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Emisión</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vencimiento</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-mono font-medium text-gray-900">{inv.correlative}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(inv.issuedAt).toLocaleDateString("es-HN")}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {inv.dueDate
                              ? new Date(inv.dueDate).toLocaleDateString("es-HN")
                              : <span className="text-gray-300">—</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASS[inv.paymentStatus]}`}>
                              {STATUS_LABEL[inv.paymentStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            L. {fmt(inv.grandTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">
                          Total pendiente
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-red-600">
                          L. {fmt(invoices.reduce((s, i) => s + Number(i.grandTotal), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Historial de pagos recientes */}
            {payments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Últimos pagos registrados
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Referencia</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(p.paymentDate).toLocaleDateString("es-HN")}
                          </td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                            {p.reference || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {p.notes || <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            L. {fmt(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pie del reporte */}
            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
              Reporte generado el {today} · Mados Hotel System
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
