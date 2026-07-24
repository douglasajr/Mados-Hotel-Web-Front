import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Printer, Package, ArrowLeft } from "lucide-react";
import { useWarehouseIssues, useDestinationHotels } from "../../hooks/useWarehouse";
import { useAuthStore } from "../../store/auth.store";
import { formatQty, formatDateTime, hotelColor } from "../../utils/warehouse.constants";
import {
  buildIssuesReportHtml,
  buildIssueHtml,
} from "../../components/warehouse/warehousePrint.template";

const todayStr = () => new Date().toLocaleDateString("en-CA");

// "Ver salidas": historial de lo que salió de bodega y para dónde,
// con reporte imprimible (PDF vía diálogo de impresión del navegador).
export default function WarehouseIssuesPage() {
  const user = useAuthStore((s) => s.user);

  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [destinationHotelId, setDestinationHotelId] = useState("ALL");

  const { hotels } = useDestinationHotels();

  // El backend filtra por rango exacto; se manda el día completo.
  const filters = {
    from: `${from}T00:00:00`,
    to: `${to}T23:59:59`,
    ...(destinationHotelId !== "ALL" && { destinationHotelId }),
  };

  const { issues, isLoading } = useWarehouseIssues(filters);

  const totalUnits = issues.reduce(
    (sum, issue) => sum + issue.items.reduce((s, item) => s + Number(item.quantity), 0),
    0
  );

  const printHtml = (html) => {
    const w = window.open("", "_blank", "width=900,height=950");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  const handlePrintReport = () =>
    printHtml(buildIssuesReportHtml(issues, { hotelName: user?.hotelName, from, to }));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Salidas de bodega</h1>
          <p className="text-gray-500 text-sm mt-1">
            Qué se sacó, cuándo y a qué hotel fue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/warehouse"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                       border border-gray-200 text-gray-600 bg-white
                       hover:border-amber-300 hover:text-amber-600 transition-all"
          >
            <ArrowLeft size={14} />
            Sacar suministros
          </Link>
          <button
            type="button"
            onClick={handlePrintReport}
            disabled={issues.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white
                       bg-linear-to-r from-amber-500 to-orange-500
                       hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer size={15} />
            Imprimir reporte
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 h-9 text-sm border border-gray-200 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 h-9 text-sm border border-gray-200 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {[{ id: "ALL", name: "Todos los hoteles" }, ...hotels].map((hotel) => (
            <button
              key={hotel.id}
              type="button"
              onClick={() => setDestinationHotelId(hotel.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all
                ${destinationHotelId === hotel.id
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-amber-300"}`}
            >
              {hotel.name}
            </button>
          ))}
        </div>

        <span className="ml-auto self-center text-xs text-gray-400">
          {issues.length} salida{issues.length !== 1 ? "s" : ""} · {formatQty(totalUnits)} unidades
        </span>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay salidas en este período</p>
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => {
            const units = issue.items.reduce((s, item) => s + Number(item.quantity), 0);
            const hotelIndex = hotels.findIndex((h) => h.id === issue.destinationHotel?.id);

            return (
              <div key={issue.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${hotelIndex >= 0 ? hotelColor(hotelIndex) : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {issue.destinationHotel?.name ?? "Sin destino"}
                  </span>
                  <span className="text-xs text-gray-500">{formatDateTime(issue.createdAt)}</span>
                  <span className="text-xs text-gray-400">· {issue.user?.name ?? "—"}</span>

                  <span className="ml-auto text-sm font-bold text-gray-900">
                    {formatQty(units)} u.
                  </span>
                  <button
                    type="button"
                    onClick={() => printHtml(buildIssueHtml(issue, user?.hotelName))}
                    title="Imprimir comprobante"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                  >
                    <FileText size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {issue.items.map((item) => (
                    <span key={item.id} className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700">
                      {item.product?.name ?? "—"}
                      <strong className="ml-1.5 text-gray-900">×{formatQty(item.quantity)}</strong>
                    </span>
                  ))}
                </div>

                {issue.notes && (
                  <p className="mt-2 text-xs text-gray-500 italic">{issue.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
