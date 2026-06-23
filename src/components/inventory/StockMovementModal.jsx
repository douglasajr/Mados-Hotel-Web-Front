import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StockMovementModal({
  product,
  products,
  mode,
  onClose,
  onSave,
  isSaving,
}) {
  const [form, setForm] = useState({
    productId: product?.id ?? "",
    quantity: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const isAdjustment = mode === "adjustment";

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.productId) return setError("Selecciona un producto");
    if (form.quantity === "") return setError("Ingresa una cantidad");

    const quantity = Number(form.quantity);
    if (!isAdjustment && quantity <= 0) {
      return setError("La entrada debe ser mayor a cero");
    }
    if (isAdjustment && quantity === 0) {
      return setError("El ajuste no puede ser cero");
    }

    try {
      await onSave({
        productId: form.productId,
        quantity,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar movimiento");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAdjustment ? "Ajustar stock" : "Registrar entrada"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Producto</Label>
            <Select
              value={form.productId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, productId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{isAdjustment ? "Cantidad a ajustar" : "Cantidad"}</Label>
            <Input
              type="number"
              step="1"
              value={form.quantity}
              onChange={set("quantity")}
              placeholder={isAdjustment ? "Ej: -2 o 5" : "Ej: 12"}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              value={form.notes}
              onChange={set("notes")}
              placeholder="Opcional"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
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
              className="flex-1 bg-linear-to-r from-amber-500 to-orange-500
                         hover:from-amber-600 hover:to-orange-600 text-white border-0"
            >
              {isSaving ? "Guardando..." : "Guardar movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
