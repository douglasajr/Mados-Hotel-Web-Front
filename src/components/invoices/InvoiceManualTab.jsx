import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ISV_OPTIONS = [
  { value: "RECEPTION", label: "Recepción (15%)" },
  { value: "FOOD",      label: "Restaurante (15%)" },
  { value: "ROOM",      label: "Habitación (19%)" },
  { value: "EXENTO",    label: "Exento" },
];

export default function InvoiceManualTab({
  manualDesc, setManualDesc,
  manualQty, setManualQty,
  manualPrice, setManualPrice,
  manualIsvType, setManualIsvType,
  manualExemptOrder, setManualExemptOrder,
  addManual,
}) {
  return (
    <div className="space-y-3 p-1">
      <div className="space-y-1.5">
        <Label className="text-xs">Descripción</Label>
        <Input
          value={manualDesc}
          onChange={(e) => setManualDesc(e.target.value)}
          placeholder="Ej. Servicio de lavandería"
          className="text-sm"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Cantidad</Label>
          <Input type="number" value={manualQty} onChange={(e) => setManualQty(e.target.value)} min="1" className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Precio (L.)</Label>
          <Input type="number" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} placeholder="0.00" className="text-sm" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Tipo ISV</Label>
        <Select value={manualIsvType} onValueChange={(v) => { setManualIsvType(v); if (v !== "EXENTO") setManualExemptOrder(""); }}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ISV_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {manualIsvType === "EXENTO" && (
        <div className="space-y-1.5">
          <Label className="text-xs">N° orden de exoneración <span className="text-gray-400">(opcional)</span></Label>
          <Input value={manualExemptOrder} onChange={(e) => setManualExemptOrder(e.target.value)} placeholder="Ej. EX-2024-00123" className="text-sm" />
        </div>
      )}

      <Button
        type="button"
        onClick={addManual}
        disabled={!manualDesc.trim() || !manualPrice || Number(manualPrice) <= 0}
        variant="outline"
        className="w-full"
      >
        <Plus size={14} className="mr-2" />
        Agregar al carrito
      </Button>
    </div>
  );
}
