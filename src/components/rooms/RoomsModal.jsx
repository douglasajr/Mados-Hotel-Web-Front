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
import { ROOM_TYPES, TYPE_LABELS } from "../../utils/rooms.constants";

export function RoomModal({ room, onClose, onSave, isSaving }) {
  const isEditing = !!room?.id;

  const [form, setForm] = useState({
    number: room?.number ?? "",
    type: room?.type ?? "SENCILLA",
    pricePerNight: room?.pricePerNight ?? "",
  });
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.number || !form.type || !form.pricePerNight)
      return setError("Todos los campos son requeridos");
    if (Number(form.pricePerNight) <= 0)
      return setError("El precio debe ser mayor a cero");

    try {
      await onSave({ ...form, pricePerNight: Number(form.pricePerNight) });
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
            {isEditing ? "Editar Habitación" : "Nueva Habitación"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={form.number}
                onChange={set("number")}
                placeholder="Ej: 101"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio por noche</Label>
              <Input
                type="number"
                value={form.pricePerNight}
                onChange={set("pricePerNight")}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de habitación</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear habitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
