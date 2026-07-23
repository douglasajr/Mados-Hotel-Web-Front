import { PAYMENT_METHOD_LABELS, DOCUMENT_TYPE_LABELS } from "../../utils/invoices.constants";
import { calcItemBreakdown, amountToWords } from "./invoicePrint.utils";

const fmt = (n) => Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AMBER  = "#d97706";
const AMBER2 = "#92400e";

const PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10.5px; color: #111; background: #fff; padding: 12px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid ${AMBER}; padding-bottom: 4px; margin-bottom: 4px; }
  .hotel-block { display: flex; align-items: center; gap: 8px; }
  .hotel-name  { font-size: 14px; font-weight: bold; letter-spacing: .02em; color: ${AMBER2}; }
  .hotel-sub   { font-size: 9px; color: #555; margin-top: 1px; line-height: 1.35; }
  .doc-block   { text-align: right; min-width: 140px; }
  .doc-type    { display: inline-block; font-size: 10.5px; font-weight: bold; border: 1.5px solid ${AMBER}; color: ${AMBER2}; padding: 2px 8px; margin-bottom: 2px; letter-spacing: .04em; border-radius: 3px; }
  .doc-corr    { font-size: 10.5px; font-weight: bold; color: #333; }
  .doc-date    { font-size: 9.5px; color: #666; margin-top: 1px; }
  .cai-block   { border: 1px solid #fde68a; border-radius: 4px; padding: 4px 8px; margin-bottom: 4px; background: #fffbeb; }
  .cai-top     { margin-bottom: 3px; padding-bottom: 3px; border-bottom: 1px solid #fde68a; }
  .cai-bottom  { display: flex; gap: 10px; }
  .cai-bottom > div { flex: 1; min-width: 0; }
  .cai-lbl     { font-size: 8.5px; text-transform: uppercase; color: #92400e; margin-bottom: 1px; letter-spacing: .03em; }
  .cai-val     { font-weight: bold; color: #222; font-size: 10px; }
  .cai-mono    { font-family: "Courier New", monospace; font-size: 9.5px; letter-spacing: .03em; word-break: break-all; }
  .info-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 4px; }
  .info-box    { border: 1px solid #fde68a; border-radius: 4px; padding: 4px 7px; background: #fffbeb; }
  .info-title  { font-size: 8.5px; text-transform: uppercase; font-weight: bold; color: ${AMBER2}; border-bottom: 1px solid #fde68a; padding-bottom: 2px; margin-bottom: 3px; letter-spacing: .05em; }
  .info-name   { font-size: 10.5px; font-weight: bold; margin-bottom: 1px; }
  .info-row    { font-size: 9.5px; color: #444; margin-bottom: 1px; }
  .info-row span { color: #92400e; }
  .voided-stamp { border: 3px solid #cc0000; color: #cc0000; font-size: 22px; font-weight: bold; text-align: center; padding: 6px; margin: 6px 0; transform: rotate(-4deg); letter-spacing: 6px; display: inline-block; width: 100%; }
  .page-stamp { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 72px; font-weight: 900; letter-spacing: 8px; pointer-events: none; z-index: 999; opacity: 0.08; white-space: nowrap; }
  .stamp-original { color: #006600; border: 8px solid #006600; padding: 4px 20px; border-radius: 6px; }
  .stamp-copia    { color: #00008b; border: 8px solid #00008b; padding: 4px 20px; border-radius: 6px; }
  .stamp-proforma { color: #c2410c; border: 8px solid #c2410c; padding: 4px 20px; border-radius: 6px; }
  .proforma-banner { border: 2px dashed #c2410c; color: #c2410c; font-weight: bold; text-align: center; padding: 5px; margin: 3px 0; letter-spacing: 2px; border-radius: 6px; font-size: 11px; }
  @media print { .page-stamp { opacity: 0.07; position: fixed; } }
  .exo-banner { background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 4px 8px; margin-bottom: 4px; font-size: 9.5px; }
  .exo-banner strong { color: ${AMBER2}; }
  .exo-banner .exo-lbl { font-size: 8.5px; text-transform: uppercase; font-weight: bold; color: ${AMBER2}; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  thead th { background: ${AMBER}; color: #fff; padding: 3px 7px; font-size: 10px; font-weight: 600; }
  thead th.num { text-align: right; }
  thead th.qty { text-align: center; width: 38px; }
  tbody td { padding: 2px 7px; border-bottom: 1px solid #f0f0f0; vertical-align: top; font-size: 10px; }
  tbody tr:nth-child(even) td { background: #fffbeb; }
  .qty  { text-align: center; width: 40px; color: #555; }
  .desc-cell { width: 55%; }
  .desc-sub  { font-size: 8.5px; color: #92400e; margin-top: 1px; }
  .num   { text-align: right; white-space: nowrap; }
  .bold  { font-weight: bold; }
  .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 4px; }
  .totals-box  { min-width: 230px; border: 1px solid #fde68a; border-radius: 4px; overflow: hidden; }
  .total-row   { display: flex; justify-content: space-between; padding: 1.5px 9px; font-size: 10px; }
  .total-row:not(:last-child) { border-bottom: 1px solid #fde68a; }
  .total-row .lbl { color: #555; }
  /* El TOTAL va en negro: imprime nítido en cualquier impresora (láser/térmica)
     y no se degrada a un gris lavado como el fondo ámbar. */
  .total-grand { background: #fff; color: #000; font-size: 12px; font-weight: bold; padding: 3.5px 9px; display: flex; justify-content: space-between; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; }
  .letras { border: 1px solid #fde68a; border-radius: 4px; padding: 4px 8px; margin-bottom: 4px; background: #fffbeb; }
  .letras-lbl { font-size: 8.5px; text-transform: uppercase; color: ${AMBER2}; margin-bottom: 1px; letter-spacing: .05em; }
  .letras-val { font-size: 9.5px; font-weight: bold; color: #111; font-style: italic; }
  .footer { border-top: 1.5px solid ${AMBER}; padding-top: 4px; margin-top: 3px; }
  .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 3px; }
  .footer-col  { font-size: 8px; color: #666; line-height: 1.3; }
  .footer-col strong { display: block; font-size: 8px; text-transform: uppercase; color: ${AMBER2}; margin-bottom: 1px; letter-spacing: .04em; }
  .footer-center { text-align: center; font-size: 8px; color: #888; margin-top: 3px; }
  .original-copia { text-align: center; font-size: 7.5px; color: #aaa; margin-top: 2px; }
  @media print { body { padding: 7mm; } @page { size: A5; margin: 0; } }
`;

export function buildPrintHtml(invoice, stampType = null) {
  const fc  = invoice.fiscalConfig ?? {};
  const expiry = fc.caiExpiry ? new Date(fc.caiExpiry).toLocaleDateString("es-HN") : "—";
  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString("es-HN", { year: "numeric", month: "2-digit", day: "2-digit" });

  // Reservaciones vinculadas via RoomCharged (multi-habitación)
  const linkedReservations = (invoice.roomCharges ?? [])
    .map(rc => rc.reservation)
    .filter(Boolean);

  // Fallback: reservación directa (legacy)
  if (invoice.reservation && linkedReservations.length === 0) linkedReservations.push(invoice.reservation);
  // Fallback: split invoice sin roomCharge propio
  if (invoice.splitSourceReservation && linkedReservations.length === 0) linkedReservations.push(invoice.splitSourceReservation);

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

  const fmtDate = (d) => new Date(d).toLocaleDateString("es-HN");

  const itemRows = itemBreakdowns.map(({ item, b }) => {
    let descExtra = "";
    if (item.isvType === "ROOM" && linkedReservations.length > 0) {
      if (linkedReservations.length === 1) {
        const r = linkedReservations[0];
        descExtra = `<div class="desc-sub">Entrada: ${fmtDate(r.checkIn)} &nbsp;·&nbsp; Salida: ${fmtDate(r.checkOut)}</div>`;
      } else {
        // Múltiples habitaciones: mostrar rango
        const dates = linkedReservations.map(r => ({ ci: new Date(r.checkIn), co: new Date(r.checkOut) }));
        const minCI = new Date(Math.min(...dates.map(d => d.ci)));
        const maxCO = new Date(Math.max(...dates.map(d => d.co)));
        descExtra = `<div class="desc-sub">Entrada: ${fmtDate(minCI)} &nbsp;·&nbsp; Salida: ${fmtDate(maxCO)}</div>`;
      }
    }
    return `<tr><td class="num qty">${Number(item.quantity)}</td><td class="desc-cell">${item.description}${descExtra}</td><td class="num">L.&nbsp;${fmt(b.unitSin)}</td><td class="num bold">L.&nbsp;${fmt(b.total)}</td></tr>`;
  }).join("");

  const logoUrl  = fc.logoUrl ?? `${window.location.origin}/mados-logo.png`;
  const isProforma = stampType === "PROFORMA";
  const stampDiv = stampType === "ORIGINAL"
    ? `<div class="page-stamp stamp-original">ORIGINAL</div>`
    : stampType === "COPIA"
    ? `<div class="page-stamp stamp-copia">COPIA</div>`
    : isProforma
    ? `<div class="page-stamp stamp-proforma">PROFORMA</div>`
    : "";

  // Huésped: siempre mostrar si existe (no solo para empresas)
  const guestLine = invoice.guest?.fullName
    ? `<div class="info-row" style="margin-top:4px;padding-top:4px;border-top:1px solid #fde68a;"><span>Huésped:</span> ${invoice.guest.fullName}</div>`
    : "";

  // Información de pago
  const paymentInfo = invoice.payments?.length > 1
    ? invoice.payments.map(p => `<div class="info-row"><span>${PAYMENT_METHOD_LABELS[p.method] ?? p.method}:</span> L.&nbsp;${fmt(Number(p.amount))}${p.reference ? ` <span style="color:#888">(${p.reference})</span>` : ""}</div>`).join("")
    : `<div class="info-row"><span>Método:</span> ${PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod ?? "—"}</div>${invoice.paymentReference ? `<div class="info-row"><span>Referencia:</span> ${invoice.paymentReference}</div>` : ""}`;

  // ── Desglose fiscal SAR ─────────────────────────────────────────────────────
  // Se calcula desde los ítems (no desde los campos guardados) porque el
  // hospedaje lleva 15% + 4% sobre la misma base, y el 15% de ROOM no queda en
  // el campo isv15 almacenado. Categorías separadas: exonerado, exento, 15%, 18%.
  const sar = (invoice.items ?? []).reduce((acc, item) => {
    const lineTotal = Number(item.subtotal) || (Number(item.quantity) * Number(item.unitPrice)) || 0;
    if (item.isExonerated) { acc.subExonerado += lineTotal; return acc; }
    if (item.isvType === "EXENTO") { acc.subExento += lineTotal; return acc; }
    if (item.isvType === "ROOM") {
      const base = lineTotal / 1.19;               // 15% + 4% incluidos
      acc.sub15 += base; acc.isv15 += base * 0.15; acc.isv4 += base * 0.04;
    } else {                                        // FOOD, RECEPTION → 15%
      const base = lineTotal / 1.15;
      acc.sub15 += base; acc.isv15 += lineTotal - base;
    }
    // 18% no existe en el catálogo actual → sub18 / isv18 quedan en 0
    return acc;
  }, { subExonerado: 0, subExento: 0, sub15: 0, sub18: 0, isv15: 0, isv18: 0, isv4: 0 });

  // Líneas de pago (EFECTIVO / TARJETA / …) al pie del cuadro de totales.
  const paymentList = invoice.payments?.length
    ? invoice.payments
    : (invoice.paymentMethod ? [{ method: invoice.paymentMethod, amount: invoice.grandTotal }] : []);
  const paymentRows = paymentList
    .map((p) => `<div class="total-row"><span class="lbl">${(PAYMENT_METHOD_LABELS[p.method] ?? p.method ?? "").toUpperCase()}</span><span>L.&nbsp;${fmt(Number(p.amount ?? 0))}</span></div>`)
    .join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${invoice.correlative}</title><style>${PRINT_CSS}</style></head><body>
${stampDiv}
<div class="header">
  <div class="hotel-block"><img src="${logoUrl}" alt="Logo" style="max-height:56px;max-width:100px;object-fit:contain;"/><div><div class="hotel-name">${fc.businessName ?? ""}</div><div class="hotel-sub">RTN: ${fc.rtn ?? ""}${fc.address ? `<br/>${fc.address}` : ""}${fc.phone ? `<br/>Tel: ${fc.phone}` : ""}</div></div></div>
  <div class="doc-block"><div class="doc-type">${DOCUMENT_TYPE_LABELS[invoice.documentType] ?? invoice.documentType}</div><div class="doc-corr">No. ${invoice.correlative}</div><div class="doc-date">Fecha: ${issuedDate}</div></div>
</div>
${invoice.voided ? '<div class="voided-stamp">ANULADA</div>' : ""}
${isProforma
  ? `<div class="proforma-banner">PROFORMA — DOCUMENTO SIN VALOR FISCAL · NO ES UN COMPROBANTE FISCAL</div>`
  : `<div class="cai-block">
  <div class="cai-top"><div class="cai-lbl">CAI</div><div class="cai-val cai-mono">${fc.cai ?? "—"}</div></div>
  <div class="cai-bottom"><div><div class="cai-lbl">Rango desde</div><div class="cai-val cai-mono">${fc.rangeStart ?? "—"}</div></div><div><div class="cai-lbl">Rango hasta</div><div class="cai-val cai-mono">${fc.rangeEnd ?? "—"}</div></div><div style="flex:0 0 auto;"><div class="cai-lbl">Fecha límite de emisión</div><div class="cai-val">${expiry}</div></div></div>
</div>`}
<div class="info-grid">
  <div class="info-box"><div class="info-title">Facturar a</div><div class="info-name">${invoice.customerName}</div>${invoice.customerRtn && invoice.customerRtn !== "9999-9999-999999" ? `<div class="info-row"><span>RTN:</span> ${invoice.customerRtn}</div>` : ""}${guestLine}</div>
  <div class="info-box"><div class="info-title">Información de pago</div>${paymentInfo}${invoice.paymentStatus === "CREDIT" ? `<div class="info-row" style="color:#1a56db;font-weight:bold;">A CRÉDITO</div>` : ""}${invoice.createdByName ? `<div class="info-row" style="margin-top:5px;padding-top:5px;border-top:1px solid #fde68a;"><span>Atendido por:</span> <strong>${invoice.createdByName}</strong></div>` : ""}</div>
</div>
<div class="exo-banner"><span class="exo-lbl">Datos del adquiriente exonerado</span> &nbsp; Orden de compra exenta: <strong>${exemptionOrders || "—"}</strong> &nbsp;·&nbsp; Registro exonerado: <strong>${invoice.exemptionRegistry || "—"}</strong> &nbsp;·&nbsp; Registro SAG: <strong>${invoice.sagRegistry || "—"}</strong></div>
<table><thead><tr><th class="qty">Cant.</th><th style="text-align:left">Descripción</th><th class="num">P. Unit. s/ISV</th><th class="num">Total</th></tr></thead><tbody>${itemRows || `<tr><td colspan="4" style="text-align:center;color:#aaa;padding:12px">Sin ítems registrados</td></tr>`}</tbody></table>
<div class="totals-wrap"><div class="totals-box">
  <div class="total-row"><span class="lbl">SUBTOTAL EXONERADO</span><span>L.&nbsp;${fmt(sar.subExonerado)}</span></div>
  <div class="total-row"><span class="lbl">SUBTOTAL EXENTO</span><span>L.&nbsp;${fmt(sar.subExento)}</span></div>
  <div class="total-row"><span class="lbl">SUBTOTAL 15%</span><span>L.&nbsp;${fmt(sar.sub15)}</span></div>
  <div class="total-row"><span class="lbl">SUBTOTAL 18%</span><span>L.&nbsp;${fmt(sar.sub18)}</span></div>
  <div class="total-row"><span class="lbl">ISV 15%</span><span>L.&nbsp;${fmt(sar.isv15)}</span></div>
  <div class="total-row"><span class="lbl">ISV 18%</span><span>L.&nbsp;${fmt(sar.isv18)}</span></div>
  <div class="total-row"><span class="lbl">ISV 4%</span><span>L.&nbsp;${fmt(sar.isv4)}</span></div>
  <div class="total-grand"><span>TOTAL</span><span>L.&nbsp;${fmt(invoice.grandTotal)}</span></div>
  ${paymentRows}
</div></div>
<div class="letras"><div class="letras-lbl">Total en letras</div><div class="letras-val">${amountToWords(invoice.grandTotal)}</div></div>
<div class="footer">
  <div class="footer-cols"><div class="footer-col"><strong>Gracias por su estadía</strong>Ha sido un placer atenderle. Esperamos volver a recibirle pronto y brindarle nuevamente nuestros servicios con la misma dedicación y calidad.</div><div class="footer-col"><strong>Política de devoluciones</strong>Las devoluciones sobre compras realizadas aplican únicamente al 60% neto del valor en efectivo o mediante nota de crédito. Consulte con recepción para más información.</div></div>
  <div class="footer-center">${isProforma ? "DOCUMENTO PROFORMA · SIN VALOR FISCAL · NO VÁLIDO PARA EFECTOS TRIBUTARIOS NI ANTE LA SAR" : "Esta factura es válida conforme a los rangos autorizados por la SAR (Secretaría de Administración de Rentas)"}</div>
  <div class="original-copia">Original: Cliente &nbsp;/&nbsp; Copia: Obligado Tributario Emisor</div>
</div>
<script>window.onload = function(){ window.print(); }; window.onafterprint = function(){ window.close(); };</script></body></html>`;
}
