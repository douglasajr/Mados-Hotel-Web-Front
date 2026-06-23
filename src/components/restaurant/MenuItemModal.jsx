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
import { UtensilsCrossed } from "lucide-react";

const SUGGESTED_CATEGORIES = [
  "Entradas",
  "Sopas",
  "Platos fuertes",
  "Bebidas",
  "Postres",
  "Desayunos",
  "Acompañamientos",
  "Mariscos",
  "Ensaladas",
];

const formatLPS = (amount) =>
  `L. ${Number(amount).toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;

export default function MenuItemModal({ item, onClose, onSave, isSaving }) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [price, setPrice] = useState(item?.price ? String(item.price) : "");
  const [invoiceDescription, setInvoiceDescription] = useState(
    item?.invoiceDescription ?? "",
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("El nombre es requerido");
    if (!category.trim()) return setError("La categoría es requerida");
    if (!price || Number(price) <= 0)
      return setError("El precio debe ser mayor a 0");

    try {
      await onSave({
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        invoiceDescription: invoiceDescription.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-orange-500" />
            {item ? "Editar item del menú" : "Nuevo item del menú"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre del plato</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Pollo a la plancha"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej. Platos fuertes"
              list="menu-categories"
            />
            <datalist id="menu-categories">
              {SUGGESTED_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Precio (L.)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150.00"
            />
            {price && Number(price) > 0 && (
              <p className="text-xs text-gray-400">
                Precio con ISV: {formatLPS(Number(price))} · Sin ISV:{" "}
                {formatLPS(Number(price) / 1.15)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Descripción en factura{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Input
              value={invoiceDescription}
              onChange={(e) => setInvoiceDescription(e.target.value)}
              placeholder="Descripción que aparece en la factura"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
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
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? "Guardando..." : item ? "Actualizar" : "Crear item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
