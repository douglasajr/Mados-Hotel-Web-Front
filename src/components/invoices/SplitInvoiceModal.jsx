import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getGuestsApi } from "../../api/guests.api";
import { formatLPS } from "../../utils/invoices.constants";
import { X, Search, Plus } from "lucide-react";

const PAYMENT_OPTS = [
  { value: "CASH",     label: "Efectivo" },
  { value: "CARD",     label: "Tarjeta" },
  { value: "TRANSFER", label: "Transferencia" },
];

let _keySeq = 0;
const nextKey = () => ++_keySeq;

function SplitRow({ split, onChange, onRemove, canRemove, label }) {
  const [search, setSearch] = useState("");

  const { data: guestData } = useQuery({
    queryKey: ["split-guest-search", split._key, search],
    queryFn: () => getGuestsApi({ search, limit: 5 }),
    enabled: !split.guest && search.length >= 2,
  });
  const guestResults = guestData?.data ?? [];

  const selectGuest = (g) => {
    onChange({
      ...split,
      guest: g,
      guestId: null,
      companyId: null,
      customerName: g.fullName,
      customerRtn: g.rtn ?? undefined,
      billedToCompany: false,
    });
    setSearch("");
  };

  const clearGuest = () =>
    onChange({
      ...split,
      guest: null, guestId: null, companyId: null,
      customerName: "Consumidor Final", customerRtn: undefined,
      billedToCompany: false,
    });

  const setPersonal = () => {
    if (!split.guest) return;
    onChange({
      ...split,
      billedToCompany: false,
      companyId: null,
      guestId: null,
      customerName: split.guest.fullName,
      customerRtn: split.guest.rtn ?? undefined,
    });
  };

  const setCompany = () => {
    if (!split.guest?.company) return;
    onChange({
      ...split,
      billedToCompany: true,
      companyId: split.guest.company.id,
      guestId: split.guest.id,
      customerName: split.guest.company.name,
      customerRtn: split.guest.company.rtn ?? undefined,
    });
  };

  const needsReference = split.paymentMethod === "CARD" || split.paymentMethod === "TRANSFER";

  return (
    <div className="border border-gray-200 rounded-xl p-3 space-y-2.5 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {split.guest ? (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-2.5 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{split.guest.fullName}</p>
            {split.guest.documentId && (
              <p className="text-[10px] text-gray-400">{split.guest.documentId}</p>
            )}
          </div>
          <button type="button" onClick={clearGuest} className="text-gray-400 hover:text-red-400 ml-2 shrink-0 transition-colors">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Huésped (opcional)..."
            className="w-full pl-7 pr-2 h-8 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white"
          />
          {search.length >= 2 && guestResults.length > 0 && (
            <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-36 overflow-y-auto">
              {guestResults.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => selectGuest(g)}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 text-xs border-b border-gray-50 last:border-0 transition-colors"
                >
                  <p className="font-medium text-gray-800">{g.fullName}</p>
                  {g.company && <p className="text-[10px] text-amber-600">{g.company.name}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {split.guest?.company && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={setPersonal}
            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all truncate px-1 ${!split.billedToCompany ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            {split.guest.fullName}
          </button>
          <button
            type="button"
            onClick={setCompany}
            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all truncate px-1 ${split.billedToCompany ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            {split.guest.company.name}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          value={split.amount}
          onChange={(e) => onChange({ ...split, amount: e.target.value })}
          placeholder="0.00"
          className="flex-1 h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white"
        />
        <select
          value={split.paymentMethod}
          onChange={(e) => onChange({ ...split, paymentMethod: e.target.value, paymentReference: "" })}
          className="h-8 rounded-lg border border-gray-200 bg-white text-xs px-2 focus:outline-none focus:border-amber-400"
        >
          <option value="">Pago...</option>
          {PAYMENT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {needsReference && (
        <input
          value={split.paymentReference}
          onChange={(e) => onChange({ ...split, paymentReference: e.target.value })}
          placeholder={split.paymentMethod === "CARD" ? "N° referencia / autorización" : "N° transferencia / confirmación"}
          className="w-full h-8 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 bg-white"
        />
      )}
    </div>
  );
}

export default function SplitInvoiceModal({ totals, onConfirm, onClose }) {
  const grandTotal = totals.grandTotal;
  const half = +(grandTotal / 2).toFixed(2);

  const makeSplit = (amount = 0) => ({
    _key: nextKey(),
    guest: null, guestId: null, companyId: null,
    customerName: "Consumidor Final", customerRtn: undefined,
    billedToCompany: false,
    amount: Number(amount).toFixed(2),
    paymentMethod: "",
    paymentReference: "",
  });

  const [splits, setSplits] = useState([
    makeSplit(half),
    makeSplit(+(grandTotal - half).toFixed(2)),
  ]);
  const [error, setError] = useState("");

  const paidSum = splits.reduce((s, sp) => s + Number(sp.amount || 0), 0);
  const diff = Math.abs(paidSum - grandTotal);

  const updateSplit = (key, val) =>
    setSplits((prev) => prev.map((s) => s._key === key ? val : s));

  const addSplit = () =>
    setSplits((prev) => [...prev, makeSplit(0)]);

  const removeSplit = (key) =>
    setSplits((prev) => prev.filter((s) => s._key !== key));

  const handleConfirm = () => {
    setError("");
    if (splits.some((s) => !s.paymentMethod))
      return setError("Selecciona el método de pago de cada porción");
    if (diff > 0.01)
      return setError(`La suma (${formatLPS(paidSum)}) no coincide con el total (${formatLPS(grandTotal)})`);
    onConfirm(splits);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Dividir factura — {formatLPS(grandTotal)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-1">
          {splits.map((split, idx) => (
            <SplitRow
              key={split._key}
              label={`Porción ${idx + 1}`}
              split={split}
              onChange={(val) => updateSplit(split._key, val)}
              onRemove={() => removeSplit(split._key)}
              canRemove={splits.length > 2}
            />
          ))}

          <button
            type="button"
            onClick={addSplit}
            className="w-full h-8 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={12} /> Agregar porción
          </button>
        </div>

        <div className={`flex justify-between text-xs font-medium px-1 mt-1 ${diff <= 0.01 ? "text-green-600" : "text-red-500"}`}>
          <span>Total asignado</span>
          <span>{formatLPS(paidSum)} / {formatLPS(grandTotal)}</span>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-9 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Crear {splits.length} facturas
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
