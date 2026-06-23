import { useState } from 'react'
import { DollarSign, ChevronLeft, ChevronRight, RefreshCw, FileText, AlertTriangle, Printer } from 'lucide-react'
import { usePendingCollection, useCashCollections } from '../../hooks/useCashCollections'
import CollectionDetailModal from '../../components/cash-collections/CollectionDetailModal'

const fmt = (n) =>
  `L ${Number(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const ISV_LABELS = { ROOM: 'Habitación', FOOD: 'Alimento', RECEPTION: 'Tienda' }
const ISV_COLORS = {
  FOOD:      'bg-orange-100 text-orange-700',
  ROOM:      'bg-blue-100 text-blue-700',
  RECEPTION: 'bg-emerald-100 text-emerald-700',
}

function MiniTable({ rows, emptyText }) {
  if (!rows?.length) return (
    <p className="text-xs text-gray-400 text-center py-2">{emptyText}</p>
  )
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
                {r.lowStock && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-semibold">bajo</span>}
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
                  : <span className="text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-100 bg-gray-50/60 text-xs font-semibold">
            <td colSpan={2} className="px-3 py-2 text-gray-500">{rows.length} ítem(s)</td>
            <td className="px-3 py-2 text-right text-gray-700">{rows.reduce((s, r) => s + r.quantity, 0)}</td>
            <td className="px-3 py-2 text-right text-gray-700">{fmt(rows.reduce((s, r) => s + r.revenue, 0))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function CashCollectionsPage() {
  const { data: pending, isLoading: loadingPending, refetch: refetchPending } = usePendingCollection()
  const { collections, total, page, totalPages, isLoading, setPage, registerCollection, isRegistering } = useCashCollections()

  const [notes, setNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const handleRegister = async () => {
    await registerCollection(notes || undefined)
    setNotes('')
    setConfirmOpen(false)
    setShowProducts(false)
    refetchPending()
  }

  const handlePrintPending = () => window.print()

  const hasPending = Number(pending?.grandTotal ?? 0) > 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recolección de Caja</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de recaudaciones del período actual</p>
        </div>
      </div>

      {/* Card pendiente */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Pendiente de recolectar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPending}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              title="Imprimir reporte"
            >
              <Printer size={15} />
            </button>
            <button
              onClick={refetchPending}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              title="Actualizar"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loadingPending ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {pending?.lastCollection && (
              <p className="text-xs text-gray-400">
                Desde: {new Date(pending.lastCollection.collectedAt).toLocaleString('es-HN')} · por {pending.lastCollection.collectedBy?.username}
              </p>
            )}

            {/* Totales por categoría */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Habitaciones', value: pending?.roomsTotal },
                { label: 'Alimentos',    value: pending?.foodTotal  },
                { label: 'Tienda',       value: pending?.storeTotal },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{fmt(value)}</p>
                </div>
              ))}
            </div>

            {/* Por método de pago */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Efectivo',      value: pending?.cashAmount     },
                { label: 'Tarjeta',       value: pending?.cardAmount     },
                { label: 'Transferencia', value: pending?.transferAmount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-500">{label}</p>
                  <p className="font-semibold text-blue-800 mt-0.5">{fmt(value)}</p>
                </div>
              ))}
            </div>

            {/* Total + botón recolectar */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <div>
                <p className="text-sm text-amber-700">Total a recolectar</p>
                <p className="text-2xl font-bold text-amber-800">{fmt(pending?.grandTotal)}</p>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!hasPending || isRegistering}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white
                           bg-linear-to-r from-amber-500 to-orange-500
                           hover:from-amber-600 hover:to-orange-600
                           disabled:opacity-40 transition-all shadow-sm"
              >
                <DollarSign size={14} className="inline mr-1.5" />
                Registrar recolección
              </button>
            </div>

            {/* Formulario confirmación */}
            {confirmOpen && (
              <div className="pt-2 border-t border-amber-200">
                <p className="text-sm text-amber-700 font-medium mb-3">
                  ¿Confirmar recolección de {fmt(pending?.grandTotal)}?
                </p>
                <div className="flex items-center gap-3">
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones opcionales..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
                  />
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white
                               hover:bg-amber-600 transition-all disabled:opacity-50"
                  >
                    {isRegistering ? 'Registrando...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Toggle ventas del período */}
            <div>
              <button
                onClick={() => setShowProducts(v => !v)}
                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                <FileText size={14} />
                {showProducts ? 'Ocultar detalle de ventas' : 'Ver detalle de ventas del período'}
              </button>

              {showProducts && (
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                      Room Charged — cargos al cuarto
                    </p>
                    <MiniTable
                      rows={pending?.roomChargedItems}
                      emptyText="Sin cargos al cuarto en este período"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                      Alimentos — restaurante
                    </p>
                    <MiniTable
                      rows={pending?.foodItems}
                      emptyText="Sin ventas de alimentos en este período"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                      Ventas directas — pulpería
                    </p>
                    <MiniTable
                      rows={pending?.directSales}
                      emptyText="Sin ventas directas en este período"
                    />
                  </div>

                  {[...(pending?.roomChargedItems ?? []), ...(pending?.directSales ?? [])].some(p => p.lowStock) && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle size={12} /> Stock bajo
                      </p>
                      {[...(pending?.roomChargedItems ?? []), ...(pending?.directSales ?? [])]
                        .filter(p => p.lowStock)
                        .map((p, i) => (
                          <p key={p.productId ?? i} className="text-xs text-red-600 flex justify-between">
                            <span>{p.name}</span>
                            <span className="font-medium">{p.currentStock} unid. (mín. {p.minStock})</span>
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Historial de recolecciones</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 text-center py-12">
            <DollarSign size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay recolecciones registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Recolectado por</th>
                  <th className="text-right px-4 py-3 font-medium">Habitaciones</th>
                  <th className="text-right px-4 py-3 font-medium">Alimentos</th>
                  <th className="text-right px-4 py-3 font-medium">Tienda</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(c.collectedAt).toLocaleString('es-HN')}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {c.collectedBy?.username}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(c.roomsTotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(c.foodTotal)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(c.storeTotal)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {fmt(c.grandTotal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetailId(c.id)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium
                                   flex items-center gap-1 ml-auto"
                      >
                        <FileText size={12} />
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">{total} recolección{total !== 1 ? 'es' : ''}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                               disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-600 px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                               disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {detailId && (
        <CollectionDetailModal
          collectionId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}
