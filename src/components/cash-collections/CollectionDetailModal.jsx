import { useCollectionDetail } from '../../hooks/useCashCollections'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Printer, AlertTriangle, X, UtensilsCrossed, ShoppingBag, Coffee } from 'lucide-react'

const fmt = (n) =>
  `L ${Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const ISV_LABELS = { ROOM: 'Habitación', FOOD: 'Alimento', RECEPTION: 'Tienda' }
const ISV_COLORS = {
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
      Sin registros en este período
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

export default function CollectionDetailModal({ collectionId, onClose }) {
  const { data, isLoading } = useCollectionDetail(collectionId)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 print:hidden">
          <DialogTitle className="text-base font-bold text-gray-900">Detalle de Recolección</DialogTitle>
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
          ) : !data ? (
            <p className="text-center text-gray-500 py-8">No se pudo cargar el detalle</p>
          ) : (
            <>
              {/* Cabecera impresión */}
              <div className="hidden print:block text-center pb-4 border-b">
                <h1 className="text-xl font-bold">Reporte de Recolección de Caja</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(data.collectedAt).toLocaleString('es-HN')} · {data.collectedBy?.username}
                </p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Fecha de recolección</p>
                  <p className="font-medium text-gray-800">{new Date(data.collectedAt).toLocaleString('es-HN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Recolectado por</p>
                  <p className="font-medium text-gray-800">{data.collectedBy?.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Período desde</p>
                  <p className="font-medium text-gray-800">{new Date(data.periodStart).toLocaleString('es-HN')}</p>
                </div>
                {data.notes && (
                  <div>
                    <p className="text-gray-400 text-xs">Notas</p>
                    <p className="font-medium text-gray-700">{data.notes}</p>
                  </div>
                )}
              </div>

              {/* Totales en 2 col */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Por categoría</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Habitaciones', value: data.roomsTotal },
                      { label: 'Alimentos',    value: data.foodTotal  },
                      { label: 'Tienda',       value: data.storeTotal },
                      { label: 'Total',        value: data.grandTotal, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className={`rounded-xl px-3 py-2 flex justify-between
                        ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-100'}`}>
                        <span className={`text-sm ${highlight ? 'font-bold text-amber-700' : 'text-gray-600'}`}>{label}</span>
                        <span className={`font-semibold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">Por método de pago</p>
                  <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                    {[
                      { label: 'Efectivo',      value: data.cashAmount     },
                      { label: 'Tarjeta',       value: data.cardAmount     },
                      { label: 'Transferencia', value: data.transferAmount },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between px-3 py-2.5 text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-medium text-gray-800">{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Room Charged */}
              <div>
                <SectionTitle icon={UtensilsCrossed}>Room Charged — cargos al cuarto</SectionTitle>
                <ItemsTable
                  rows={data.roomChargedItems}
                  footerLabel={`${data.roomChargedItems?.length ?? 0} cargo(s)`}
                />
              </div>

              {/* Alimentos restaurante */}
              <div>
                <SectionTitle icon={Coffee}>Alimentos — restaurante</SectionTitle>
                <ItemsTable
                  rows={data.foodItems}
                  footerLabel={`${data.foodItems?.length ?? 0} ítem(s)`}
                />
              </div>

              {/* Ventas directas */}
              <div>
                <SectionTitle icon={ShoppingBag}>Ventas directas — pulpería</SectionTitle>
                <ItemsTable
                  rows={data.directSales}
                  footerLabel={`${data.directSales?.length ?? 0} producto(s)`}
                />
                {data.directSales?.some(p => p.lowStock) && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle size={12} /> Stock bajo
                    </p>
                    {data.directSales.filter(p => p.lowStock).map(p => (
                      <p key={p.productId} className="text-xs text-red-600 flex justify-between">
                        <span>{p.name}</span>
                        <span className="font-medium">{p.currentStock} unid. (mín. {p.minStock})</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Firmas impresión */}
              <div className="hidden print:flex justify-between pt-10 mt-6 border-t border-gray-300 text-xs text-gray-500">
                <div className="text-center"><div className="border-t border-gray-400 w-44 pt-1 mt-8">Cajero</div></div>
                <div className="text-center"><div className="border-t border-gray-400 w-44 pt-1 mt-8">Administrador</div></div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
