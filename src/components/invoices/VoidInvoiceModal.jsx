import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { formatLPS } from "../../utils/invoices.constants";

export default function VoidInvoiceModal({
  invoice,
  onClose,
  onSave,
  isSaving,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!reason.trim()) return setError("El motivo de anulación es requerido");

    try {
      await onSave({ id: invoice.id, reason });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al anular la factura");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} />
            Anular Factura
          </DialogTitle>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Esta acción no se puede deshacer. La factura{" "}
          <strong>{invoice.correlative}</strong> por{" "}
          <strong>{formatLPS(invoice.grandTotal)}</strong> quedará marcada como
          anulada.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motivo de anulación</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Error en datos del cliente, factura duplicada..."
              rows={3}
            />
          </div>

          {error && (
            <div
              className="flex items-start gap-2.5 bg-red-50 border border-red-200
                            border-l-2 border-l-red-500 rounded-lg px-3.5 py-2.5
                            text-red-600 text-sm"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isSaving ? "Anulando..." : "Confirmar anulación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
