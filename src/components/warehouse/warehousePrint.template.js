import { AREA_LABELS, formatQty, formatDateTime, formatDateTimeShort, formatDayString } from "../../utils/warehouse.constants";

const AMBER = "#d97706";
const AMBER2 = "#92400e";

const PRINT_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; padding: 16px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid ${AMBER}; padding-bottom: 6px; margin-bottom: 8px; }
  .hotel-name { font-size: 15px; font-weight: bold; color: ${AMBER2}; }
  .hotel-sub  { font-size: 9.5px; color: #555; margin-top: 2px; }
  .doc-type   { display: inline-block; font-size: 11px; font-weight: bold;
                border: 1.5px solid ${AMBER}; color: ${AMBER2};
                padding: 3px 10px; border-radius: 3px; letter-spacing: .04em; }
  .doc-date   { font-size: 10px; color: #666; margin-top: 3px; text-align: right; }

  .meta { display: flex; gap: 8px; margin-bottom: 8px; }
  .meta-box { flex: 1; border: 1px solid #fde68a; background: #fffbeb;
              border-radius: 4px; padding: 5px 9px; }
  .meta-lbl { font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em;
              color: ${AMBER2}; font-weight: bold; margin-bottom: 2px; }
  .meta-val { font-size: 11px; font-weight: bold; color: #222; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  thead th { background: ${AMBER}; color: #fff; padding: 4px 8px; font-size: 10px;
             font-weight: 600; text-align: left; }
  thead th.num { text-align: right; }
  tbody td { padding: 3px 8px; border-bottom: 1px solid #f0f0f0; font-size: 10.5px; vertical-align: top; }
  tbody tr:nth-child(even) { background: #fffdf7; }
  td.num { text-align: right; font-weight: bold; }
  .group-head td { background: #fef3c7; font-weight: bold; color: ${AMBER2};
                   font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }
  .notes { font-size: 9.5px; color: #666; font-style: italic; }

  .total-box { display: flex; justify-content: flex-end; margin-bottom: 10px; }
  .total-row { display: flex; justify-content: space-between; gap: 24px;
               border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;
               padding: 4px 10px; font-size: 12px; font-weight: bold; min-width: 220px; }

  .sign { display: flex; gap: 40px; margin-top: 26px; }
  .sign-col { flex: 1; text-align: center; }
  .sign-line { border-top: 1px solid #333; margin-bottom: 3px; }
  .sign-lbl { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: .04em; }

  .footer { text-align: center; font-size: 8.5px; color: #999; margin-top: 14px;
            border-top: 1px solid #eee; padding-top: 5px; }

  @media print { body { padding: 10mm; } @page { size: A4; margin: 0; } }
`;

const shell = (title, hotelName, docType, bodyHtml) => `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"/><title>${title}</title><style>${PRINT_CSS}</style></head><body>
<div class="header">
  <div>
    <div class="hotel-name">${hotelName}</div>
    <div class="hotel-sub">Control de bodega &middot; Documento interno</div>
  </div>
  <div style="text-align:right">
    <span class="doc-type">${docType}</span>
    <div class="doc-date">Impreso: ${formatDateTime(new Date())}</div>
  </div>
</div>
${bodyHtml}
<div class="footer">Documento interno de control de inventario &middot; Sin valor fiscal</div>
<script>window.onload = function(){ window.print(); }; window.onafterprint = function(){ window.close(); };</script>
</body></html>`;

// ── Comprobante de UNA salida (se imprime al confirmar el carrito) ──────────
export function buildIssueHtml(issue, hotelName = "Hotel Mados") {
  const rows = issue.items
    .map((item) => `<tr>
      <td>${item.product?.name ?? "—"}</td>
      <td class="num">${formatQty(item.quantity)}</td>
    </tr>`)
    .join("");

  const totalUnits = issue.items.reduce((sum, item) => sum + Number(item.quantity), 0);

  const body = `
<div class="meta">
  <div class="meta-box"><div class="meta-lbl">Área destino</div><div class="meta-val">${AREA_LABELS[issue.area] ?? issue.area}</div></div>
  <div class="meta-box"><div class="meta-lbl">Entregado por</div><div class="meta-val">${issue.user?.name ?? "—"}</div></div>
  <div class="meta-box"><div class="meta-lbl">Fecha y hora</div><div class="meta-val">${formatDateTime(issue.createdAt)}</div></div>
</div>
${issue.notes ? `<div class="meta-box" style="margin-bottom:8px"><div class="meta-lbl">Observaciones</div><div class="notes">${issue.notes}</div></div>` : ""}
<table>
  <thead><tr><th>Suministro</th><th class="num" style="width:90px">Cantidad</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="total-box"><div class="total-row"><span>TOTAL DE UNIDADES</span><span>${formatQty(totalUnits)}</span></div></div>
<div class="sign">
  <div class="sign-col"><div class="sign-line"></div><div class="sign-lbl">Entrega (bodega)</div></div>
  <div class="sign-col"><div class="sign-line"></div><div class="sign-lbl">Recibe (${AREA_LABELS[issue.area] ?? issue.area})</div></div>
</div>`;

  return shell(`Salida de bodega`, hotelName, "SALIDA DE BODEGA", body);
}

// ── Reporte de VARIAS salidas, agrupado por área ───────────────────────────
export function buildIssuesReportHtml(issues, { hotelName = "Hotel Mados", from, to } = {}) {
  // Se agrupa por área para que el reporte responda "qué se sacó y para dónde".
  const byArea = {};
  for (const issue of issues) {
    if (!byArea[issue.area]) byArea[issue.area] = [];
    byArea[issue.area].push(issue);
  }

  let totalUnits = 0;
  let sections = "";

  for (const area of Object.keys(byArea).sort()) {
    const areaIssues = byArea[area];
    let areaUnits = 0;
    let rows = "";

    for (const issue of areaIssues) {
      for (const item of issue.items) {
        areaUnits += Number(item.quantity);
        rows += `<tr>
          <td>${formatDateTimeShort(issue.createdAt)}</td>
          <td>${item.product?.name ?? "—"}</td>
          <td>${issue.user?.name ?? "—"}</td>
          <td class="num">${formatQty(item.quantity)}</td>
        </tr>`;
      }
    }

    totalUnits += areaUnits;
    sections += `<tr class="group-head"><td colspan="4">${AREA_LABELS[area] ?? area} — ${formatQty(areaUnits)} unidades</td></tr>${rows}`;
  }

  const period = from || to
    ? `${from ? formatDayString(from) : "inicio"} — ${to ? formatDayString(to) : "hoy"}`
    : "Todas las salidas registradas";

  const body = `
<div class="meta">
  <div class="meta-box"><div class="meta-lbl">Período</div><div class="meta-val">${period}</div></div>
  <div class="meta-box"><div class="meta-lbl">Salidas incluidas</div><div class="meta-val">${issues.length}</div></div>
  <div class="meta-box"><div class="meta-lbl">Total de unidades</div><div class="meta-val">${formatQty(totalUnits)}</div></div>
</div>
<table>
  <thead><tr><th style="width:112px">Fecha</th><th>Suministro</th><th style="width:130px">Entregó</th><th class="num" style="width:80px">Cant.</th></tr></thead>
  <tbody>${sections || `<tr><td colspan="4" style="text-align:center;color:#aaa;padding:16px">Sin salidas en este período</td></tr>`}</tbody>
</table>
<div class="total-box"><div class="total-row"><span>TOTAL GENERAL</span><span>${formatQty(totalUnits)}</span></div></div>`;

  return shell("Reporte de salidas de bodega", hotelName, "REPORTE DE SALIDAS", body);
}
