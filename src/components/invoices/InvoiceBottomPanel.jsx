import { Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLPS } from "../../utils/invoices.constants";

const PAYMENT_OPTS = [
  { value: "CASH",     label: "Efectivo" },
  { value: "CARD",     label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CREDIT",   label: "Crédito", creditOnly: true },
];

export default function InvoiceBottomPanel({
  items, totals, isReceipt,
  selectedCustomer, billedAs, setBilledAs, resolvedCustomer,
  customerSearch, setCustomerSearch, guestResults, companyResults,
  handleSelectGuest, handleSelectCompany, clearCustomer,
  isExonerada, setIsExonerada, globalExemptionOrder, setGlobalExemptionOrder,
  paymentMethod, setPaymentMethod, cashReceived, setCashReceived, change,
  paymentReference, setPaymentReference,
  error, isSaving, onClose,
}) {
  return (
    <div className="border-t border-gray-100 p-4 space-y-3 bg-white shrink-0">

      {/* Totales */}
      {items.length > 0 && (
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal (sin ISV)</span><span>{formatLPS(totals.subtotal)}</span>
          </div>
          {totals.isv15 > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>ISV 15%</span><span>{formatLPS(totals.isv15)}</span>
            </div>
          )}
          {totals.isv4 > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>ISV 4% (turismo)</span><span>{formatLPS(totals.isv4)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span><span>{formatLPS(totals.grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Cliente (solo en factura fiscal) */}
      {!isReceipt && (
        <div className="space-y-2">
          <Label className="text-xs">Cliente</Label>
          {selectedCustomer ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedCustomer.type === "company" ? (
                    <Building2 size={13} className="text-amber-500 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700 shrink-0">
                      {(selectedCustomer.fullName ?? "?")[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {selectedCustomer.type === "company" ? selectedCustomer.name : selectedCustomer.fullName}
                    </p>
                    {resolvedCustomer.rtn && (
                      <p className="text-[10px] text-gray-400">
                        RTN: {resolvedCustomer.rtn}
                        {resolvedCustomer.hasCredit && <span className="ml-1 text-green-600 font-medium">· Con crédito</span>}
                      </p>
                    )}
                  </div>
                </div>
                <button type="button" onClick={clearCustomer} className="text-xs text-gray-400 hover:text-red-500 ml-2 shrink-0">Cambiar</button>
              </div>

              {selectedCustomer.type === "guest" && selectedCustomer.company && (
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {["guest", "company"].map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setBilledAs(side)}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${billedAs === side ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      {side === "guest" ? selectedCustomer.fullName : selectedCustomer.company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Nombre, RTN o documento..."
                className="h-8 text-sm pl-7"
              />
              {(guestResults.length > 0 || companyResults.length > 0) && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {guestResults.length > 0 && (
                    <>
                      <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Huéspedes</p>
                      {guestResults.map((g) => (
                        <button key={g.id} type="button" onClick={() => handleSelectGuest(g)} className="w-full text-left px-3 py-2 hover:bg-amber-50 text-xs border-b border-gray-50 last:border-0">
                          <p className="font-medium text-gray-900">{g.fullName}</p>
                          <p className="text-gray-400">
                            {g.documentId && <span>{g.documentId}</span>}
                            {g.rtn && <span className="ml-1">· RTN: {g.rtn}</span>}
                            {g.company && <span className="ml-1 text-amber-600">· {g.company.name}</span>}
                          </p>
                        </button>
                      ))}
                    </>
                  )}
                  {companyResults.length > 0 && (
                    <>
                      <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50">Empresas</p>
                      {companyResults.map((c) => (
                        <button key={c.id} type="button" onClick={() => handleSelectCompany(c)} className="w-full text-left px-3 py-2 hover:bg-amber-50 text-xs border-b border-gray-50 last:border-0">
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-gray-400">RTN: {c.rtn}{c.hasCredit && <span className="ml-1 text-green-600">· Con crédito</span>}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Exoneración global */}
      {!isReceipt && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => { setIsExonerada(!isExonerada); setGlobalExemptionOrder(""); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isExonerada ? "bg-teal-50 border-teal-300 text-teal-700" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"}`}
          >
            <span>Factura exonerada (sin ISV)</span>
            <span className={`w-8 h-4 rounded-full transition-colors relative ${isExonerada ? "bg-teal-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isExonerada ? "left-4" : "left-0.5"}`} />
            </span>
          </button>
          {isExonerada && (
            <Input value={globalExemptionOrder} onChange={(e) => setGlobalExemptionOrder(e.target.value)} placeholder="N° orden de exoneración (opcional)" className="h-8 text-sm border-teal-200 focus:border-teal-400" />
          )}
        </div>
      )}

      {/* Método de pago */}
      <div className="space-y-2">
        <Label className="text-xs">Método de pago</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {PAYMENT_OPTS.map((opt) => {
            const disabled = opt.creditOnly && !resolvedCustomer.hasCredit;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !disabled && setPaymentMethod(opt.value)}
                disabled={disabled}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  disabled ? "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                  : paymentMethod === opt.value ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                }`}
              >
                {opt.label}
                {opt.creditOnly && !resolvedCustomer.hasCredit && <span className="block text-[9px] font-normal opacity-60">Solo empresas</span>}
              </button>
            );
          })}
        </div>

        {paymentMethod === "CASH" && (
          <div className="bg-green-50 rounded-lg px-3 py-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 w-28 shrink-0">Monto recibido</Label>
              <Input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder="0.00" className="h-7 text-sm flex-1" autoFocus />
            </div>
            {change !== null && (
              <div className={`flex items-center justify-between text-xs font-semibold ${change < 0 ? "text-red-600" : "text-green-700"}`}>
                <span>{change < 0 ? "Falta" : "Vuelto"}</span>
                <span>{formatLPS(Math.abs(change))}</span>
              </div>
            )}
          </div>
        )}

        {["CARD", "TRANSFER"].includes(paymentMethod) && (
          <Input
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder={paymentMethod === "CARD" ? "N° de referencia / autorización" : "N° de transferencia / confirmación"}
            className="h-8 text-sm"
          />
        )}
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isSaving || items.length === 0} className="flex-1 h-9 text-sm bg-amber-500 hover:bg-amber-600 text-white border-0">
          {isSaving ? "Generando..." : isReceipt ? "Generar recibo" : "Generar factura"}
        </Button>
      </div>
    </div>
  );
}
