import { Eye, Ban, FileText, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOCUMENT_TYPE_LABELS,
  BILLED_TO_LABELS,
  PAYMENT_STATUS_CONFIG,
  formatLPS,
} from "../../utils/invoices.constants";

export default function InvoiceTable({ invoices, onView, onVoid, isAdmin }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Correlativo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado pago</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className={inv.voided ? "opacity-50" : ""}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center
                                  border border-amber-100 shrink-0"
                  >
                    {inv.documentType === "INVOICE" ? (
                      <FileText size={15} className="text-amber-600" />
                    ) : (
                      <Receipt size={15} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {inv.correlative}
                    </p>
                    {inv.voided && (
                      <div>
                        <span className="text-[0.65rem] font-semibold text-red-500 uppercase tracking-wide">
                          Anulada
                        </span>
                        {inv.creditNotes?.[0]?.reason && (
                          <p className="text-[0.65rem] text-red-400 max-w-[160px] truncate" title={inv.creditNotes[0].reason}>
                            {inv.creditNotes[0].reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <p className="text-sm font-medium text-gray-900">
                  {inv.customerName}
                </p>
                <p className="text-xs text-gray-500">
                  {BILLED_TO_LABELS[inv.billedTo]}
                  {inv.customerRtn && ` · ${inv.customerRtn}`}
                </p>
              </TableCell>

              <TableCell className="text-sm text-gray-600">
                {DOCUMENT_TYPE_LABELS[inv.documentType]}
              </TableCell>

              <TableCell className="text-sm font-semibold text-gray-900">
                {formatLPS(inv.grandTotal)}
              </TableCell>

              <TableCell>
                <Badge
                  className={PAYMENT_STATUS_CONFIG[inv.paymentStatus]?.class}
                >
                  {PAYMENT_STATUS_CONFIG[inv.paymentStatus]?.label}
                </Badge>
              </TableCell>

              <TableCell className="text-sm text-gray-500">
                {new Date(inv.issuedAt).toLocaleDateString("es-HN")}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                    onClick={() => onView(inv)}
                    title="Ver detalle"
                  >
                    <Eye size={14} />
                  </Button>
                  {isAdmin && !inv.voided && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onVoid(inv)}
                      title="Anular factura"
                    >
                      <Ban size={14} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {invoices.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron facturas</p>
        </div>
      )}
    </div>
  );
}
