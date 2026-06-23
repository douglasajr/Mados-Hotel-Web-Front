import { PAYMENT_METHOD_LABELS, DOCUMENT_TYPE_LABELS } from "../../utils/invoices.constants";
import { calcItemBreakdown, amountToWords } from "./invoicePrint.utils";

const fmt = (n) => Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2 });

const PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 20px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 8px; }
  .hotel-block { display: flex; align-items: center; gap: 10px; }
  .hotel-name  { font-size: 17px; font-weight: bold; letter-spacing: .02em; }
  .hotel-sub   { font-size: 11px; color: #555; margin-top: 2px; line-height: 1.5; }
  .doc-block   { text-align: right; min-width: 160px; }
  .doc-type    { display: inline-block; font-size: 12px; font-weight: bold; border: 2px solid #111; padding: 4px 11px; margin-bottom: 4px; letter-spacing: .04em; }
  .doc-corr    { font-size: 11.5px; font-weight: bold; color: #333; }
  .doc-date    { font-size: 10.5px; color: #666; margin-top: 2px; }
  .cai-block   { border: 1px solid #d0d0d0; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; background: #fafafa; }
  .cai-top     { margin-bottom: 5px; padding-bottom: 5px; border-bottom: 1px solid #e5e5e5; }
  .cai-bottom  { display: flex; gap: 12px; }
  .cai-bottom > div { flex: 1; min-width: 0; }
  .cai-lbl     { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 2px; letter-spacing: .03em; }
  .cai-val     { font-weight: bold; color: #222; font-size: 11.5px; }
  .cai-mono    { font-family: "Courier New", monospace; font-size: 11px; letter-spacing: .04em; word-break: break-all; }
  .info-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .info-box    { border: 1px solid #e0e0e0; border-radius: 4px; padding: 6px 9px; }
  .info-title  { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #888; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 4px; letter-spacing: .05em; }
  .info-name   { font-size: 12.5px; font-weight: bold; margin-bottom: 2px; }
  .info-row    { font-size: 11px; color: #444; margin-bottom: 1px; }
  .info-row span { color: #888; }
  .voided-stamp { border: 3px solid #cc0000; color: #cc0000; font-size: 24px; font-weight: bold; text-align: center; padding: 8px; margin: 10px 0; transform: rotate(-4deg); letter-spacing: 6px; display: inline-block; width: 100%; }
  .page-stamp { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 72px; font-weight: 900; letter-spacing: 8px; pointer-events: none; z-index: 999; opacity: 0.08; white-space: nowrap; }
  .stamp-original { color: #006600; border: 8px solid #006600; padding: 4px 20px; border-radius: 6px; }
  .stamp-copia    { color: #00008b; border: 8px solid #00008b; padding: 4px 20px; border-radius: 6px; }
  @media print { .page-stamp { opacity: 0.07; position: fixed; } }
  .exo-banner { background: #f0faf5; border: 1px solid #6fcf97; border-radius: 4px; padding: 7px 10px; margin-bottom: 10px; font-size: 11.5px; }
  .exo-banner strong { color: #1a7f4b; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  thead th { background: #111; color: #fff; padding: 6px 8px; font-size: 11px; font-weight: 600; }
  thead th.num { text-align: right; }
  thead th.qty { text-align: center; width: 42px; }
  tbody td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; font-size: 11.5px; }
  tbody tr:nth-child(even) td { background: #fafafa; }
  .qty  { text-align: center; width: 46px; color: #555; }
  .desc-cell { width: 55%; }
  .desc-sub  { font-size: 10.5px; color: #777; margin-top: 2px; }
  .num   { text-align: right; white-space: nowrap; }
  .bold  { font-weight: bold; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 8px; }
  .totals-box  { min-width: 260px; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
  .total-row   { display: flex; justify-content: space-between; padding: 4px 10px; font-size: 11.5px; }
  .total-row:not(:last-child) { border-bottom: 1px solid #f0f0f0; }
  .total-row .lbl { color: #555; }
  .total-grand { background: #111; color: #fff; font-size: 12.5px; font-weight: bold; padding: 6px 10px; display: flex; justify-content: space-between; }
  .letras { border: 1px solid #ddd; border-radius: 4px; padding: 6px 10px; margin-bottom: 8px; }
  .letras-lbl { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 2px; letter-spacing: .05em; }
  .letras-val { font-size: 11px; font-weight: bold; color: #111; font-style: italic; }
  .footer { border-top: 1px solid #ddd; padding-top: 7px; margin-top: 4px; }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 5px; }
  .footer-col  { font-size: 10px; color: #666; }
  .footer-col strong { display: block; font-size: 9.5px; text-transform: uppercase; color: #888; margin-bottom: 2px; letter-spacing: .04em; }
  .footer-center { text-align: center; font-size: 10px; color: #888; margin-top: 4px; }
  .original-copia { text-align: center; font-size: 9.5px; color: #aaa; margin-top: 3px; }
  @media print { body { padding: 10mm; } @page { size: A5; margin: 0; } }
`;

export function buildPrintHtml(invoice, stampType = null) {
  const fc  = invoice.fiscalConfig ?? {};
  const res = invoice.reservation ?? null;
  const expiry = fc.caiExpiry ? new Date(fc.caiExpiry).toLocaleDateString("es-HN") : "—";
  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString("es-HN", { year: "numeric", month: "2-digit", day: "2-digit" });

  const itemBreakdowns = (invoice.items ?? []).map((item) => ({ item, b: calcItemBreakdown(item) }));

  const fromItems = itemBreakdowns.reduce(
    (acc, { item, b }) => {
      acc.gravado += b.gravado; acc.isv15 += b.isv15; acc.isv4 += b.isv4;
      if (item.isExonerated && item.exemptionOrderNumber) acc.exonerado += b.total;
      else if (item.isExonerated) acc.exento += b.total;
      return acc;
    },
    { gravado: 0, isv15: 0, isv4: 0, exonerado: 0, exento: 0 }
  );

  const hasItems = itemBreakdowns.length > 0;
  const T = {
    gravado:   hasItems ? fromItems.gravado   : Number(invoice.subtotal  ?? 0),
    isv15:     hasItems ? fromItems.isv15     : Number(invoice.isv15     ?? 0),
    isv4:      hasItems ? fromItems.isv4      : Number(invoice.isv4      ?? 0),
    exonerado: fromItems.exonerado,
    exento:    hasItems ? fromItems.exento    : Number(invoice.isvExento ?? 0),
  };

  const hasExempt = (invoice.items ?? []).some((i) => i.isExonerated);
  const exemptionOrders = [...new Set((invoice.items ?? []).filter((i) => i.isExonerated && i.exemptionOrderNumber).map((i) => i.exemptionOrderNumber))].join(", ");

  const itemRows = itemBreakdowns.map(({ item, b }) => {
    const isRoom = item.isvType === "ROOM";
    let descExtra = "";
    if (isRoom && res) {
      const ci = new Date(res.checkIn  + (res.checkIn.includes("T")  ? "" : "T12:00:00")).toLocaleDateString("es-HN");
      const co = new Date(res.checkOut + (res.checkOut.includes("T") ? "" : "T12:00:00")).toLocaleDateString("es-HN");
      descExtra = `<div class="desc-sub">Entrada: ${ci} &nbsp;·&nbsp; Salida: ${co}</div>`;
    }
    return `<tr><td class="num qty">${Number(item.quantity)}</td><td class="desc-cell">${item.description}${descExtra}</td><td class="num">L.&nbsp;${fmt(b.unitSin)}</td><td class="num bold">L.&nbsp;${fmt(b.total)}</td></tr>`;
  }).join("");

  const logoUrl  = fc.logoUrl ?? `${window.location.origin}/mados-logo.png`;
  const stampDiv = stampType === "ORIGINAL"
    ? `<div class="page-stamp stamp-original">ORIGINAL</div>`
    : stampType === "COPIA"
    ? `<div class="page-stamp stamp-copia">COPIA</div>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${invoice.correlative}</title><style>${PRINT_CSS}</style></head><body>
${stampDiv}
<div class="header">
  <div class="hotel-block"><img src="${logoUrl}" alt="Logo" style="max-height:56px;max-width:100px;object-fit:contain;"/><div><div class="hotel-name">${fc.businessName ?? ""}</div><div class="hotel-sub">RTN: ${fc.rtn ?? ""}${fc.address ? `<br/>${fc.address}` : ""}${fc.phone ? `<br/>Tel: ${fc.phone}` : ""}</div></div></div>
  <div class="doc-block"><div class="doc-type">${DOCUMENT_TYPE_LABELS[invoice.documentType] ?? invoice.documentType}</div><div class="doc-corr">No. ${invoice.correlative}</div><div class="doc-date">Fecha: ${issuedDate}</div></div>
</div>
${invoice.voided ? '<div class="voided-stamp">ANULADA</div>' : ""}
<div class="cai-block">
  <div class="cai-top"><div class="cai-lbl">CAI</div><div class="cai-val cai-mono">${fc.cai ?? "—"}</div></div>
  <div class="cai-bottom"><div><div class="cai-lbl">Rango desde</div><div class="cai-val cai-mono">${fc.rangeStart ?? "—"}</div></div><div><div class="cai-lbl">Rango hasta</div><div class="cai-val cai-mono">${fc.rangeEnd ?? "—"}</div></div><div style="flex:0 0 auto;"><div class="cai-lbl">Fecha límite de emisión</div><div class="cai-val">${expiry}</div></div></div>
</div>
<div class="info-grid">
  <div class="info-box"><div class="info-title">Facturar a</div><div class="info-name">${invoice.customerName}</div>${invoice.customerRtn && invoice.customerRtn !== "9999-9999-999999" ? `<div class="info-row"><span>RTN:</span> ${invoice.customerRtn}</div>` : ""}</div>
  <div class="info-box"><div class="info-title">Información de pago</div><div class="info-row"><span>Método:</span> ${PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod ?? "—"}</div>${invoice.paymentReference ? `<div class="info-row"><span>Referencia:</span> ${invoice.paymentReference}</div>` : ""}${invoice.paymentStatus === "CREDIT" ? `<div class="info-row" style="color:#1a56db;font-weight:bold;">A CRÉDITO</div>` : ""}${invoice.createdByName ? `<div class="info-row" style="margin-top:5px;padding-top:5px;border-top:1px solid #f0f0f0;"><span>Atendido por:</span> <strong>${invoice.createdByName}</strong></div>` : ""}</div>
</div>
${hasExempt ? `<div class="exo-banner"><strong>Factura Exonerada</strong>${exemptionOrders ? ` &nbsp;·&nbsp; Orden N°: <strong>${exemptionOrders}</strong>` : ""}</div>` : ""}
<table><thead><tr><th class="qty">Cant.</th><th style="text-align:left">Descripción</th><th class="num">P. Unit. s/ISV</th><th class="num">Total</th></tr></thead><tbody>${itemRows || `<tr><td colspan="4" style="text-align:center;color:#aaa;padding:12px">Sin ítems registrados</td></tr>`}</tbody></table>
<div class="totals-wrap"><div class="totals-box">
  ${T.gravado   > 0 ? `<div class="total-row"><span class="lbl">Subtotal gravado (s/ISV)</span><span>L.&nbsp;${fmt(T.gravado)}</span></div>` : ""}
  ${T.isv15     > 0 ? `<div class="total-row"><span class="lbl">ISV 15%</span><span>L.&nbsp;${fmt(T.isv15)}</span></div>` : ""}
  ${T.isv4      > 0 ? `<div class="total-row"><span class="lbl">ISV 4% (hospedaje)</span><span>L.&nbsp;${fmt(T.isv4)}</span></div>` : ""}
  ${T.exonerado > 0 ? `<div class="total-row"><span class="lbl">Exonerado</span><span>L.&nbsp;${fmt(T.exonerado)}</span></div>` : ""}
  ${T.exento    > 0 ? `<div class="total-row"><span class="lbl">Exento</span><span>L.&nbsp;${fmt(T.exento)}</span></div>` : ""}
  <div class="total-grand"><span>TOTAL A PAGAR</span><span>L.&nbsp;${fmt(invoice.grandTotal)}</span></div>
</div></div>
<div class="letras"><div class="letras-lbl">Total en letras</div><div class="letras-val">${amountToWords(invoice.grandTotal)}</div></div>
<div class="footer">
  <div class="footer-cols"><div class="footer-col"><strong>Gracias por su estadía</strong>Ha sido un placer atenderle. Esperamos volver a recibirle pronto y brindarle nuevamente nuestros servicios con la misma dedicación y calidad.</div><div class="footer-col"><strong>Política de devoluciones</strong>Las devoluciones sobre compras realizadas aplican únicamente al 60% neto del valor en efectivo o mediante nota de crédito. Consulte con recepción para más información.</div></div>
  <div class="footer-center">Esta factura es válida conforme a los rangos autorizados por la SAR (Secretaría de Administración de Rentas)</div>
  <div class="original-copia">Original: Cliente &nbsp;/&nbsp; Copia: Empresa</div>
</div>
<script>window.onload = function(){ window.print(); }; window.onafterprint = function(){ window.close(); };</script></body></html>`;
}
