import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from "../../utils/invoices.constants";

export default function NewInvoicePaymentMethod({
  paymentMethod,
  onPaymentMethodChange,
}) {
  return (
    <div className="space-y-1.5">
      <Label>Método de pago</Label>
      <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Selecciona un método" />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHODS.map((method) => (
            <SelectItem key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
