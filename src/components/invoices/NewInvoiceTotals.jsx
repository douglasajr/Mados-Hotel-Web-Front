import { formatLPS } from "../../utils/invoices.constants";

export default function NewInvoiceTotals({ totals }) {
  return (
    <div className="bg-[#111008] rounded-xl p-4 space-y-1.5 text-sm">
      <div className="flex justify-between text-white/50">
        <span>Subtotal</span>
        <span>{formatLPS(totals.subtotal)}</span>
      </div>
      {totals.isv15 > 0 && (
        <div className="flex justify-between text-white/50">
          <span>ISV 15%</span>
          <span>{formatLPS(totals.isv15)}</span>
        </div>
      )}
      {totals.isv4 > 0 && (
        <div className="flex justify-between text-white/50">
          <span>ISV 4% (Turismo)</span>
          <span>{formatLPS(totals.isv4)}</span>
        </div>
      )}
      {totals.isvExento > 0 && (
        <div className="flex justify-between text-white/50">
          <span>Exento</span>
          <span>{formatLPS(totals.isvExento)}</span>
        </div>
      )}
      <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
        <span>Total</span>
        <span>{formatLPS(totals.grandTotal)}</span>
      </div>
    </div>
  );
}
