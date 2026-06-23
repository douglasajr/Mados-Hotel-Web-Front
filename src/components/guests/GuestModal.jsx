import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCompaniesApi } from "../../api/companies.api";

export default function GuestModal({ guest, onClose, onSave, isSaving }) {
  const isEditing = !!guest?.id;

  const [form, setForm] = useState({
    fullName: guest?.fullName ?? "",
    documentId: guest?.documentId ?? "",
    rtn: guest?.rtn ?? "",
    phone: guest?.phone ?? "",
    email: guest?.email ?? "",
    companyId: guest?.companyId ?? "",
  });
  const [error, setError] = useState("");

  // Trae las empresas activas para el selector
  const { data: companiesData } = useQuery({
    queryKey: ["companies-all"],
    queryFn: () => getCompaniesApi({ limit: 100 }),
  });
  const companies = companiesData?.data ?? [];

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.documentId)
      return setError("Nombre y documento son requeridos");
    try {
      await onSave({
        ...form,
        companyId: form.companyId || null, // si no seleccionó, manda null
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
          <DialogTitle>
            {isEditing ? "Editar Huésped" : "Nuevo Huésped"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre completo</Label>
            <Input
              value={form.fullName}
              onChange={set("fullName")}
              placeholder="Juan Pérez"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Documento de identidad</Label>
              <Input
                value={form.documentId}
                onChange={set("documentId")}
                placeholder="0801-1990-12345"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                RTN <span className="text-gray-400 text-xs">(opcional)</span>
              </Label>
              <Input
                value={form.rtn}
                onChange={set("rtn")}
                placeholder="06011977021030"
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input
                value={form.phone}
                onChange={set("phone")}
                placeholder="9999-8888"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="juan@gmail.com"
                className="text-sm"
              />
            </div>
          </div>

          {/* Empresa */}
          <div className="space-y-1.5">
            <Label>
              Empresa
              <span className="text-gray-400 text-xs ml-1">(opcional)</span>
            </Label>
            <Select
              value={form.companyId || "none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, companyId: v === "none" ? "" : v }))
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sin empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-gray-400">Sin empresa</span>
                </SelectItem>
                {companies
                  .filter((c) => c.status === "ACTIVE")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div
              className="flex items-start gap-2.5 bg-red-50 border border-red-200
                            border-l-2 border-l-red-500 rounded-lg px-3.5 py-2.5
                            text-red-600 text-sm"
            >
              <svg
                className="shrink-0 mt-0.5"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
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
                  : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
