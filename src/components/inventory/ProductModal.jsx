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
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductModal({
  product,
  categories,
  onClose,
  onSave,
  isSaving,
}) {
  const isEditing = Boolean(product?.id);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    categoryId: product?.categoryId ?? product?.category?.id ?? "",
    price: product?.price ?? "",
    minStock: product?.minStock ?? "",
    invoiceDescription: product?.invoiceDescription ?? "",
    isGlobal: Boolean(product?.isGlobal),
  });
  const [error, setError] = useState("");

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name || !form.categoryId || !form.price || !form.minStock) {
      return setError("Completa nombre, categoría, precio y stock mínimo");
    }

    if (Number(form.price) < 0) return setError("El precio no puede ser negativo");
    if (Number(form.minStock) <= 0) {
      return setError("El stock mínimo debe ser mayor a cero");
    }

    try {
      await onSave({
        name: form.name.trim(),
        categoryId: form.categoryId,
        price: Number(form.price),
        minStock: Number(form.minStock),
        invoiceDescription: form.invoiceDescription.trim() || undefined,
        isGlobal: form.isGlobal,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar producto");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="Ej: Agua embotellada"
            />
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={form.categoryId}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, categoryId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set("price")}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Stock mínimo</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.minStock}
                onChange={set("minStock")}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción para factura</Label>
            <Input
              value={form.invoiceDescription}
              onChange={set("invoiceDescription")}
              placeholder="Opcional"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <Checkbox
              checked={form.isGlobal}
              onCheckedChange={(value) =>
                setForm((current) => ({ ...current, isGlobal: Boolean(value) }))
              }
            />
            Producto global
          </label>

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
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
