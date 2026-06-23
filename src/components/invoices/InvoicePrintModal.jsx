import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { getInvoiceByIdApi } from "../../api/invoices.api";
import { PAYMENT_METHOD_LABELS, DOCUMENT_TYPE_LABELS } from "../../utils/invoices.constants";
import { buildPrintHtml } from "./invoicePrint.template";

const fmt = (n) => Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2 });

export default function InvoicePrintModal({ invoiceId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    getInvoiceByIdApi(invoiceId)
      .then(setInvoice)
      .catch((e) => setError(e.response?.data?.error || "Error al cargar la factura"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePrint = (stampType = null) => {
    if (!invoice) return;
    const w = window.open("", "_blank", "width=850,height=900");
    w.document.write(buildPrintHtml(invoice, stampType));
    w.document.close();
  };

  if (!invoiceId) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer size={17} />
            Vista previa de impresión
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin text-amber-500" />
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-4">{error}</p>}

        {invoice && !loading && (
          <div className="space-y-4">
            {/* Vista previa resumida */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-xs space-y-1 text-gray-700">
              <p className="text-center font-bold text-sm text-gray-900 not-font-mono">{invoice.fiscalConfig?.businessName}</p>
              <p className="text-center text-gray-500 text-[10px]">RTN: {invoice.fiscalConfig?.rtn}</p>
              <div className="border-t border-dashed border-gray-300 my-2" />
              <p className="text-center font-bold">{DOCUMENT_TYPE_LABELS[invoice.documentType]}</p>
              {invoice.voided && <p className="text-center text-red-600 font-bold border border-red-400 py-0.5">ANULADA</p>}
              <p><span className="text-gray-400">No.:</span> {invoice.correlative}</p>
              <p><span className="text-gray-400">Fecha:</span> {new Date(invoice.issuedAt).toLocaleDateString("es-HN")}</p>
              <p><span className="text-gray-400">Cliente:</span> {invoice.customerName}</p>
              <p><span className="text-gray-400">Pago:</span> {PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? "—"}</p>
              {invoice.paymentReference && <p><span className="text-gray-400">Ref.:</span> {invoice.paymentReference}</p>}
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              {(invoice.items ?? []).map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate max-w-[65%]">{item.quantity}x {item.description}</span>
                  <span>L.{fmt(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-300 my-1.5" />
              {Number(invoice.isv15) > 0 && <div className="flex justify-between text-gray-500"><span>ISV 15%</span><span>L.{fmt(invoice.isv15)}</span></div>}
              {Number(invoice.isv4)  > 0 && <div className="flex justify-between text-gray-500"><span>ISV 4%</span><span>L.{fmt(invoice.isv4)}</span></div>}
              {Number(invoice.isvExento) > 0 && <div className="flex justify-between text-gray-500"><span>Exento</span><span>L.{fmt(invoice.isvExento)}</span></div>}
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1">
                <span>TOTAL</span><span>L.{fmt(invoice.grandTotal)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-9" onClick={() => handlePrint(null)}>
                <Printer size={13} className="mr-1.5" />Sin sello
              </Button>
              <Button className="bg-green-700 hover:bg-green-800 text-white text-xs h-9" onClick={() => handlePrint("ORIGINAL")}>
                <Printer size={13} className="mr-1.5" />Original
              </Button>
              <Button className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-9" onClick={() => handlePrint("COPIA")}>
                <Printer size={13} className="mr-1.5" />Copia
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
