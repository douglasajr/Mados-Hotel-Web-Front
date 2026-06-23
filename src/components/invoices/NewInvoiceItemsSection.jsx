import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ISV_TYPE_LABELS, formatLPS } from "../../utils/invoices.constants";

export default function NewInvoiceItemsSection({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}) {
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex items-center justify-between">
        <Label>Conceptos</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddItem}
          className="h-7 text-xs"
        >
          <Plus size={12} className="mr-1" />
          Agregar
        </Button>
      </div>

      <div className="w-full min-w-0 space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full min-w-0 border border-gray-100 rounded-lg p-4 space-y-3"
          >
            <div className="flex gap-3 min-w-0">
              <Input
                value={item.description}
                onChange={(e) =>
                  onUpdateItem(index, "description", e.target.value)
                }
                placeholder="Descripción"
                className="text-sm flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="text-gray-300 hover:text-red-500 px-1"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[110px_minmax(0,1fr)_190px_130px]">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onUpdateItem(index, "quantity", e.target.value)
                }
                placeholder="Cant."
                className="min-w-0 text-sm"
              />
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) =>
                  onUpdateItem(index, "unitPrice", e.target.value)
                }
                placeholder="Precio unit."
                className="min-w-0 text-sm"
              />
              <Select
                value={item.isvType}
                onValueChange={(value) => onUpdateItem(index, "isvType", value)}
                disabled={item.isExonerated}
              >
                <SelectTrigger className="h-9 min-w-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ISV_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-xs text-gray-600 px-1 min-h-9">
                <Checkbox
                  checked={item.isExonerated}
                  onCheckedChange={(value) =>
                    onUpdateItem(index, "isExonerated", Boolean(value))
                  }
                />
                Exonerado
              </label>
            </div>

            <p className="text-right text-xs font-semibold text-gray-700">
              {formatLPS(
                (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
