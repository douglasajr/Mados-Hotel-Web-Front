import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function CompanyModal({ company, onClose, onSave, isSaving }) {
  const isEditing = !!company?.id;
  const [form, setForm] = useState({
    name: company?.name ?? "",
    rtn: company?.rtn ?? "",
    address: company?.address ?? "",
    contactName: company?.contactName ?? "",
    contactEmail: company?.contactEmail ?? "",
    hasCredit: company?.hasCredit ?? false,
    creditLimit: company?.creditLimit ?? "",
    paymentDays: company?.paymentDays ?? 30,
  });
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.rtn) return setError("Nombre y RTN son requeridos");
    if (form.hasCredit && !form.creditLimit)
      return setError("El límite de crédito es requerido");
    try {
      await onSave({
        ...form,
        creditLimit: form.hasCredit ? Number(form.creditLimit) : 0,
        paymentDays: Number(form.paymentDays),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nueva Empresa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la empresa</Label>
              <Input
                value={form.name}
                onChange={set("name")}
                placeholder="Coca Cola HN"
              />
            </div>
            <div className="space-y-2">
              <Label>RTN</Label>
              <Input
                value={form.rtn}
                onChange={set("rtn")}
                placeholder="06011999123456"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Dirección{" "}
              <span className="text-gray-400 text-xs">(opcional)</span>
            </Label>
            <Input
              value={form.address}
              onChange={set("address")}
              placeholder="Col. Miraflores, Tegucigalpa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contacto</Label>
              <Input
                value={form.contactName}
                onChange={set("contactName")}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label>Email contacto</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={set("contactEmail")}
                placeholder="juan@empresa.com"
              />
            </div>
          </div>

          {/* Crédito */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Línea de crédito
                </p>
                <p className="text-xs text-gray-500">
                  ¿Esta empresa tiene crédito?
                </p>
              </div>
              <Switch
                checked={form.hasCredit}
                onCheckedChange={(val) => setForm({ ...form, hasCredit: val })}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            {form.hasCredit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Límite de crédito (L.)</Label>
                  <Input
                    type="number"
                    value={form.creditLimit}
                    onChange={set("creditLimit")}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Días de pago</Label>
                  <Input
                    type="number"
                    value={form.paymentDays}
                    onChange={set("paymentDays")}
                    placeholder="30"
                  />
                </div>
              </div>
            )}
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
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
