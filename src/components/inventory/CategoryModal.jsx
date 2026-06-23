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

const CATEGORY_SCOPES = [
  { value: "PULPERIA", label: "Pulpería" },
  { value: "COCINA", label: "Cocina" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "GENERAL", label: "General" },
];

export default function CategoryModal({ onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    scope: "GENERAL",
    invoiceDescription: "",
  });
  const [error, setError] = useState("");

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("El nombre es obligatorio");

    try {
      await onSave({
        name: form.name.trim(),
        scope: form.scope,
        invoiceDescription: form.invoiceDescription.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear categoría");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={set("name")}
              placeholder="Ej: Bebidas"
            />
          </div>

          <div className="space-y-2">
            <Label>Área</Label>
            <Select
              value={form.scope}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, scope: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_SCOPES.map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    {scope.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción para factura</Label>
            <Input
              value={form.invoiceDescription}
              onChange={set("invoiceDescription")}
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
              {isSaving ? "Guardando..." : "Crear categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
