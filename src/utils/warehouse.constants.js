// Áreas del hotel a las que se entregan suministros. El `value` debe coincidir
// exactamente con el enum WarehouseArea de Prisma.
export const WAREHOUSE_AREAS = [
  { value: "COCINA",        label: "Cocina",        color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "RESTAURANTE",   label: "Restaurante",   color: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "LIMPIEZA",      label: "Limpieza",      color: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "RECEPCION",     label: "Recepción",     color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "MANTENIMIENTO", label: "Mantenimiento", color: "bg-violet-100 text-violet-700 border-violet-200" },
];

export const AREA_LABELS = Object.fromEntries(
  WAREHOUSE_AREAS.map((area) => [area.value, area.label])
);

export const formatQty = (n) => {
  const value = Number(n);
  // Sin decimales cuando es entero: "3" se lee mejor que "3.00".
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("es-HN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// Versión corta para las filas del reporte: cabe en una línea.
export const formatDateTimeShort = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// OJO: `new Date("2026-07-22")` se interpreta como medianoche UTC, que en
// Honduras (UTC-6) cae el día ANTERIOR a las 6 p.m. Por eso el "YYYY-MM-DD"
// que viene de un <input type="date"> se formatea a mano, sin pasar por Date.
export const formatDayString = (day) => {
  const [year, month, dayOfMonth] = String(day).split("-");
  return `${dayOfMonth}/${month}/${year}`;
};
