import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Receipt, Printer } from "lucide-react";
import {
  DOCUMENT_TYPE_LABELS,
  BILLED_TO_LABELS,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  formatLPS,
} from "../../utils/invoices.constants";
import InvoicePrintModal from "./InvoicePrintModal";

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between text-sm py-1.5">
    <span className="text-gray-500">{label}</span>
    <span className={bold ? "font-bold text-gray-900" : "text-gray-700"}>
      {value}
    </span>
  </div>
);

export default function InvoiceDetailModal({ invoice, onClose }) {
  const [showPrint, setShowPrint] = useState(false);

  if (!invoice) return null;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {invoice.documentType === "INVOICE" ? (
                <FileText size={18} />
              ) : (
                <Receipt size={18} />
              )}
              {invoice.correlative}
            </DialogTitle>
          </DialogHeader>

          {invoice.voided && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1.5">
              <p className="text-red-600 text-sm font-bold uppercase tracking-wide text-center">
                Factura Anulada
              </p>
              {invoice.creditNotes?.[0] && (
                <>
                  <div className="h-px bg-red-200" />
                  <div className="flex items-start gap-2 text-sm text-red-700">
                    <span className="font-semibold shrink-0">Motivo:</span>
                    <span>{invoice.creditNotes[0].reason}</span>
                  </div>
                  {invoice.creditNotes[0].correlative && (
                    <p className="text-xs text-red-400 font-mono">
                      Nota de crédito: {invoice.creditNotes[0].correlative}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Cliente */}
          <div className="bg-[#111008] rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
              {BILLED_TO_LABELS[invoice.billedTo]}
            </p>
            <p className="text-white font-semibold text-sm">
              {invoice.customerName}
            </p>
            {invoice.customerRtn && (
              <p className="text-white/40 text-xs mt-0.5">
                RTN: {invoice.customerRtn}
              </p>
            )}
            {invoice.guest?.fullName && invoice.billedTo === "COMPANY" && (
              <p className="text-white/50 text-xs mt-1">
                Huésped: {invoice.guest.fullName}
              </p>
            )}
          </div>

          {/* Detalle fiscal */}
          <div className="border border-gray-100 rounded-xl p-4 divide-y divide-gray-50">
            <Row
              label="Tipo de documento"
              value={DOCUMENT_TYPE_LABELS[invoice.documentType]}
            />
            <Row label="Subtotal" value={formatLPS(invoice.subtotal)} />
            {Number(invoice.isv15) > 0 && (
              <Row label="ISV 15%" value={formatLPS(invoice.isv15)} />
            )}
            {Number(invoice.isv18) > 0 && (
              <Row label="ISV 18%" value={formatLPS(invoice.isv18)} />
            )}
            {Number(invoice.isv4) > 0 && (
              <Row label="ISV 4%" value={formatLPS(invoice.isv4)} />
            )}
            {Number(invoice.isvExento) > 0 && (
              <Row label="Exento" value={formatLPS(invoice.isvExento)} />
            )}
            <Row label="Total" value={formatLPS(invoice.grandTotal)} bold />
          </div>

          {/* Pago */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge className={PAYMENT_STATUS_CONFIG[invoice.paymentStatus]?.class}>
                {PAYMENT_STATUS_CONFIG[invoice.paymentStatus]?.label}
              </Badge>
              {invoice.payments?.length > 0 ? (
                <span className="text-sm text-gray-500">Pago mixto</span>
              ) : invoice.paymentMethod ? (
                <span className="text-sm text-gray-500">{PAYMENT_METHOD_LABELS[invoice.paymentMethod]}</span>
              ) : null}
            </div>
            {invoice.payments?.length > 1 && (
              <div className="space-y-0.5">
                {invoice.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-500 px-1">
                    <span>{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
                    <span>{formatLPS(Number(p.amount))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            Emitida el{" "}
            {new Date(invoice.issuedAt).toLocaleDateString("es-HN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* Botón de impresión */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPrint(true)}
          >
            <Printer size={15} className="mr-2" />
            Imprimir factura
          </Button>
        </DialogContent>
      </Dialog>

      {showPrint && (
        <InvoicePrintModal
          invoiceId={invoice.id}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
}
