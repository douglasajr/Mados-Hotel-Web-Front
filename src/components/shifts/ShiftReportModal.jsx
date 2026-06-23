import { useShiftReport } from '../../hooks/useShifts'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Printer, TrendingUp, AlertTriangle, UtensilsCrossed, X, ShoppingBag, Coffee } from 'lucide-react'

const fmt = (n) =>
  `L ${Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const METHOD_LABELS = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', CREDIT: 'Crédito' }
const ISV_LABELS    = { ROOM: 'Habitación', FOOD: 'Alimento', RECEPTION: 'Tienda' }
const ISV_COLORS    = {
  FOOD:      'bg-orange-100 text-orange-700',
  ROOM:      'bg-blue-100 text-blue-700',
  RECEPTION: 'bg-emerald-100 text-emerald-700',
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2 mt-1">
      {Icon && <Icon size={14} className="shrink-0" />}
      {children}
    </h3>
  )
}

function ItemsTable({ rows, footerLabel }) {
  if (!rows?.length) return (
    <p className="text-xs text-gray-400 text-center py-3 bg-white border border-gray-100 rounded-xl">
      Sin registros en este turno
    </p>
  )

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0)
  const totalRev = rows.reduce((s, r) => s + r.revenue, 0)

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-400 text-xs border-b border-gray-100">
            <th className="text-left px-3 py-2 font-medium">Descripción</th>
            <th className="text-left px-3 py-2 font-medium">Tipo</th>
            <th className="text-right px-3 py-2 font-medium">Cant.</th>
            <th className="text-right px-3 py-2 font-medium">Total</th>
            <th className="text-right px-3 py-2 font-medium">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={r.productId ?? i} className="hover:bg-gray-50/50">
              <td className="px-3 py-2 text-gray-700">
                {r.name}
                {r.lowStock && (
                  <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-semibold">bajo</span>
                )}
              </td>
              <td className="px-3 py-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ISV_COLORS[r.isvType] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ISV_LABELS[r.isvType] ?? r.isvType ?? '—'}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-gray-700">{r.quantity}</td>
              <td className="px-3 py-2 text-right text-gray-700">{fmt(r.revenue)}</td>
              <td className="px-3 py-2 text-right">
                {r.currentStock !== null
                  ? <span className={r.lowStock ? 'text-red-600 font-semibold' : 'text-gray-400'}>{r.currentStock}</span>
                  : <span className="text-gray-300">—</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-gray-50/60 text-xs font-semibold">
            <td className="px-3 py-2 text-gray-500" colSpan={2}>{footerLabel}</td>
            <td className="px-3 py-2 text-right text-gray-700">{totalQty}</td>
            <td className="px-3 py-2 text-right text-gray-700">{fmt(totalRev)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function ShiftReportModal({ shiftId, onClose }) {
  const { data: report, isLoading } = useShiftReport(shiftId)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 print:hidden">
          <DialogTitle className="text-base font-bold text-gray-900">Reporte de Turno</DialogTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all"
            >
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cuerpo scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !report ? (
            <p className="text-center text-gray-500 py-8">No se pudo cargar el reporte</p>
          ) : (
            <>
              {/* Cabecera impresión */}
              <div className="hidden print:block text-center pb-4 border-b">
                <h1 className="text-xl font-bold">Reporte de Cierre de Turno</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {report.shift.user?.username} · {new Date(report.shift.startTime).toLocaleString('es-HN')}
                  {report.shift.endTime ? ` → ${new Date(report.shift.endTime).toLocaleString('es-HN')}` : ' (abierto)'}
                </p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Apertura</p>
                  <p className="font-medium text-gray-800">{new Date(report.shift.startTime).toLocaleString('es-HN')}</p>
                </div>
                {report.shift.endTime && (
                  <div>
                    <p className="text-gray-400 text-xs">Cierre</p>
                    <p className="font-medium text-gray-800">{new Date(report.shift.endTime).toLocaleString('es-HN')}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs">Usuario</p>
                  <p className="font-medium text-gray-800">{report.shift.user?.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Estado</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                    ${report.shift.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {report.shift.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                {report.shift.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs">Observaciones</p>
                    <p className="font-medium text-gray-700">{report.shift.notes}</p>
                  </div>
                )}
              </div>

              {/* Ingresos + métodos + facturas */}
              <div>
                <SectionTitle icon={TrendingUp}>Ingresos por categoría</SectionTitle>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Habitaciones', value: report.revenue?.rooms },
                    { label: 'Alimentos',    value: report.revenue?.food  },
                    { label: 'Tienda',       value: report.revenue?.store },
                    { label: 'Total',        value: report.revenue?.total, highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className={`rounded-xl p-3 flex justify-between items-center
                      ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-100'}`}>
                      <span className={`text-sm ${highlight ? 'font-bold text-amber-700' : 'text-gray-600'}`}>{label}</span>
                      <span className={`font-semibold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{fmt(value)}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {report.paymentMethods && Object.keys(report.paymentMethods).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1.5">Por método de pago</p>
                      <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                        {Object.entries(report.paymentMethods).map(([m, amount]) => (
                          <div key={m} className="flex justify-between px-3 py-2 text-sm">
                            <span className="text-gray-500">{METHOD_LABELS[m] ?? m}</span>
                            <span className="font-medium text-gray-800">{fmt(amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Facturas emitidas</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Total',   value: report.invoiceCount ?? 0, color: 'text-gray-800'  },
                        { label: 'Pagadas', value: report.paidCount   ?? 0, color: 'text-green-600' },
                        { label: 'Crédito', value: report.creditCount ?? 0, color: 'text-amber-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white border border-gray-100 rounded-xl p-2 text-center">
                          <p className={`text-xl font-bold ${color}`}>{value}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Charged */}
              <div>
                <SectionTitle icon={UtensilsCrossed}>Room Charged — cargos al cuarto</SectionTitle>
                <ItemsTable
                  rows={report.roomChargedItems}
                  footerLabel={`${report.roomChargedItems?.length ?? 0} cargo(s)`}
                />
              </div>

              {/* Alimentos restaurante */}
              <div>
                <SectionTitle icon={Coffee}>Alimentos — restaurante</SectionTitle>
                <ItemsTable
                  rows={report.foodItems}
                  footerLabel={`${report.foodItems?.length ?? 0} ítem(s)`}
                />
              </div>

              {/* Ventas directas de factura */}
              <div>
                <SectionTitle icon={ShoppingBag}>Ventas directas — pulpería</SectionTitle>
                <ItemsTable
                  rows={report.directSales}
                  footerLabel={`${report.directSales?.length ?? 0} producto(s)`}
                />
              </div>

              {/* Stock bajo */}
              {report.lowStockAlerts?.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={14} /> Alertas de stock bajo
                  </p>
                  <ul className="space-y-1">
                    {report.lowStockAlerts.map((p) => (
                      <li key={p.productId} className="text-sm text-red-600 flex justify-between">
                        <span>{p.name}</span>
                        <span className="font-medium">{p.quantity} unid. (mín. {p.minStock})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Firmas impresión */}
              <div className="hidden print:flex justify-between pt-10 mt-6 border-t border-gray-300 text-xs text-gray-500">
                <div className="text-center"><div className="border-t border-gray-400 w-44 pt-1 mt-8">Cajero / Recepcionista</div></div>
                <div className="text-center"><div className="border-t border-gray-400 w-44 pt-1 mt-8">Administrador</div></div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
