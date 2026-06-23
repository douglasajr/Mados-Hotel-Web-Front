import { Download, Search } from "lucide-react";
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
import { CUSTOMER_TYPES } from "../../utils/invoices.constants";

export default function NewInvoiceCustomerSection({
  customerType,
  onCustomerTypeChange,
  selectedGuest,
  onClearGuest,
  isFetchingCharges,
  onLoadPending,
  guestSearch,
  onGuestSearchChange,
  guestResults,
  onSelectGuest,
  selectedCompany,
  companies,
  onSelectCompany,
  customerName,
  onCustomerNameChange,
  customerRtn,
  onCustomerRtnChange,
}) {
  return (
    <>
      <div className="w-full min-w-0 space-y-1.5">
        <Label>Cliente</Label>
        <Select value={customerType} onValueChange={onCustomerTypeChange}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CUSTOMER_TYPES.CONSUMER}>
              Consumidor Final
            </SelectItem>
            <SelectItem value={CUSTOMER_TYPES.GUEST}>Huésped</SelectItem>
            <SelectItem value={CUSTOMER_TYPES.COMPANY}>Empresa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {customerType === CUSTOMER_TYPES.GUEST && (
        <div className="space-y-1.5">
          <Label>Buscar huésped</Label>
          {selectedGuest ? (
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-amber-50 border border-amber-200
                         rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {selectedGuest.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedGuest.documentId}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onLoadPending}
                  disabled={isFetchingCharges}
                  className="h-8 text-xs"
                >
                  <Download size={12} className="mr-1.5" />
                  {isFetchingCharges ? "Cargando..." : "Cargar consumos"}
                </Button>
                <button
                  type="button"
                  onClick={onClearGuest}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Cambiar
                </button>
              </div>
            </div>
          ) : (
            <div className="relative min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                value={guestSearch}
                onChange={(e) => onGuestSearchChange(e.target.value)}
                placeholder="Nombre o documento..."
                className="pl-8 text-sm"
              />
              {guestResults.length > 0 && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200
                             rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {guestResults.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => onSelectGuest(guest)}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 text-sm border-b
                                 border-gray-50 last:border-0"
                    >
                      <p className="font-medium text-gray-900">
                        {guest.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {guest.documentId}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {customerType === CUSTOMER_TYPES.COMPANY && (
        <div className="w-full min-w-0 space-y-1.5">
          <Label>Empresa</Label>
          <Select
            value={selectedCompany?.id ?? ""}
            onValueChange={onSelectCompany}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Selecciona una empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies
                .filter((company) => company.status === "ACTIVE")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Nombre / Razón social</Label>
          <Input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Consumidor Final"
            className="text-sm"
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label>
            RTN <span className="text-gray-400 text-xs">(opcional)</span>
          </Label>
          <Input
            value={customerRtn}
            onChange={(e) => onCustomerRtnChange(e.target.value)}
            placeholder="9999-9999-999999"
            className="text-sm"
            readOnly
          />
        </div>
      </div>
    </>
  );
}
