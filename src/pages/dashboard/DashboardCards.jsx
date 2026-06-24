import {
  BedDouble, TrendingUp, AlertTriangle,
  CreditCard, Package, UtensilsCrossed, ShoppingBag, FileText, Receipt,
} from 'lucide-react'

export const formatLPS = (amount) =>
  `L. ${Number(amount).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
  </div>
)

export const RoomsCard = ({ rooms }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <BedDouble size={16} className="text-blue-600" />Habitaciones
    </h3>
    <div className="grid grid-cols-2 gap-2.5">
      {[
        { label: 'Disponibles',  value: rooms.available,   bg: 'bg-green-50',  text: 'text-green-700',  num: 'text-green-800' },
        { label: 'Ocupadas',     value: rooms.occupied,    bg: 'bg-blue-50',   text: 'text-blue-600',   num: 'text-blue-800' },
        { label: 'Limpieza',     value: rooms.cleaning,    bg: 'bg-yellow-50', text: 'text-yellow-600', num: 'text-yellow-800' },
        { label: 'Mantenimiento',value: rooms.maintenance, bg: 'bg-red-50',    text: 'text-red-600',    num: 'text-red-800' },
      ].map(({ label, value, bg, text, num }) => (
        <div key={label} className={`rounded-lg p-3 ${bg}`}>
          <p className={`text-xl font-bold ${num}`}>{value}</p>
          <p className={`text-xs font-medium ${text}`}>{label}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-500">Ocupación</span>
        <span className="font-semibold text-gray-900">{rooms.occupancyRate}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${rooms.occupancyRate}%` }} />
      </div>
    </div>
  </div>
)

export const SalesCard = ({ sales }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <TrendingUp size={16} className="text-green-600" />Ventas
    </h3>
    <div className="space-y-4">
      {[
        { label: 'Hoy', data: sales.today },
        { label: 'Esta semana', data: sales.week },
        { label: 'Este mes', data: sales.month },
      ].map(({ label, data }) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            <span className="font-bold text-gray-900 text-sm">{formatLPS(data.total)}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Efectivo', value: data.CASH,     bg: 'bg-green-50',  text: 'text-green-700' },
              { label: 'Tarjeta',  value: data.CARD,     bg: 'bg-blue-50',   text: 'text-blue-700' },
              { label: 'Transfer.',value: data.TRANSFER, bg: 'bg-purple-50', text: 'text-purple-700' },
            ].map(({ label: l, value, bg, text }) => (
              <div key={l} className={`rounded-lg p-2 text-center ${bg}`}>
                <p className={`text-[10px] font-medium ${text}`}>{l}</p>
                <p className={`text-xs font-bold ${text}`}>{formatLPS(value)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const LowStockCard = ({ lowStock }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <AlertTriangle size={16} className="text-yellow-500" />
      Stock bajo
      {lowStock.count > 0 && <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{lowStock.count}</span>}
    </h3>
    {lowStock.count === 0 ? (
      <div className="text-center py-6">
        <Package size={28} className="text-green-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Inventario al día</p>
      </div>
    ) : (
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {lowStock.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
              <p className="text-xs text-gray-500">Mínimo: {item.minStock}</p>
            </div>
            <span className={`text-sm font-bold ${item.currentStock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>{item.currentStock}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

export const PendingInvoicesCard = ({ pendingInvoices }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <CreditCard size={16} className="text-red-500" />
      Por cobrar
      {pendingInvoices.count > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{pendingInvoices.count}</span>}
    </h3>
    {pendingInvoices.count === 0 ? (
      <div className="text-center py-6">
        <CreditCard size={28} className="text-green-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Sin cuentas pendientes</p>
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold text-red-600 mb-3">{formatLPS(pendingInvoices.total)}</p>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {pendingInvoices.items.slice(0, 6).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{inv.customerName}</p>
                <p className="text-xs text-gray-500">{inv.correlative}</p>
              </div>
              <span className="text-sm font-bold text-red-600 ml-2 shrink-0">{formatLPS(inv.grandTotal)}</span>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)

export const TopSellingCard = ({ topProducts, topMenuItems }) => {
  if (!topProducts?.length && !topMenuItems?.length) return null
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-orange-500" />Más vendidos este mes
      </h3>
      <div className="space-y-4">
        {topProducts?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2"><ShoppingBag size={12} className="text-amber-500" /><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pulpería</p></div>
            <div className="space-y-1.5">
              {topProducts.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 shrink-0 bg-amber-100 rounded text-[11px] font-bold text-amber-700 flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate">{p.productName}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">{p.totalSold} u.</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {topMenuItems?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2"><UtensilsCrossed size={12} className="text-orange-500" /><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Restaurante</p></div>
            <div className="space-y-1.5">
              {topMenuItems.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 shrink-0 bg-orange-100 rounded text-[11px] font-bold text-orange-700 flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">{item.totalOrdered} u.</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const CompaniesAlertCard = ({ companies }) => {
  if (!companies?.length) return null
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
      <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-orange-500" />Empresas cerca del límite de crédito
      </h3>
      <div className="space-y-2">
        {companies.map((c, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-orange-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-900">{c.name}</span>
              <span className="text-xs font-bold text-orange-700">{c.usagePercent}%</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${c.usagePercent >= 95 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(c.usagePercent, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatLPS(c.creditAvailable)} disponible de {formatLPS(c.creditLimit)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const CaiAlert = ({ caiAlert }) => {
  if (!caiAlert?.isExpiringSoon) return null
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
      <AlertTriangle size={20} className="text-orange-500 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-orange-800">CAI por vencer en {caiAlert.daysUntilExpiry} días</p>
        <p className="text-xs text-orange-600">Vence el {new Date(caiAlert.expiryDate).toLocaleDateString('es-HN')}</p>
      </div>
    </div>
  )
}

// Facturado vs Recibo (mes en curso)
export const BillingCard = ({ billing }) => {
  if (!billing?.month) return null
  const m = billing.month
  const grand = m.total || 0
  const rows = [
    { label: 'Facturas (fiscal)', data: m.invoice, dot: 'bg-blue-500',  Icon: FileText },
    { label: 'Recibos',           data: m.receipt, dot: 'bg-teal-500',  Icon: Receipt },
  ]
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={16} className="text-blue-600" />Facturado este mes
      </h3>
      <p className="text-2xl font-bold text-gray-900 mb-4">
        {formatLPS(grand)}<span className="text-sm font-normal text-gray-400 ml-2">total emitido</span>
      </p>
      <div className="space-y-3">
        {rows.map(({ label, data, dot, Icon }) => {
          const pct = grand > 0 ? Math.round((data.total / grand) * 100) : 0
          return (
            <div key={label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Icon size={13} className="text-gray-400" />{label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatLPS(data.total)}<span className="text-xs text-gray-400 ml-1">· {data.count} doc.</span>
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${dot}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Estado del CAI: correlativos usados / faltantes / total + vencimiento
export const CaiStatusCard = ({ caiAlert }) => {
  if (!caiAlert?.correlatives) return null
  const c = caiAlert.correlatives
  const pct = Math.min(c.usagePercent, 100)
  const barColor = c.isRunningOut ? 'bg-red-500' : pct >= 80 ? 'bg-orange-400' : 'bg-indigo-500'
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText size={16} className="text-indigo-600" />Estado del CAI
      </h3>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-indigo-800">{c.used}</p>
          <p className="text-xs text-indigo-600">Usados</p>
        </div>
        <div className={`rounded-lg p-3 text-center ${c.isRunningOut ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-xl font-bold ${c.isRunningOut ? 'text-red-700' : 'text-green-700'}`}>{c.remaining}</p>
          <p className={`text-xs ${c.isRunningOut ? 'text-red-600' : 'text-green-600'}`}>Faltan</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gray-800">{c.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500">Uso del rango</span>
        <span className="font-semibold text-gray-900">{c.usagePercent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500">Vence</span>
        <span className={`font-medium ${caiAlert.isExpiringSoon ? 'text-orange-600' : 'text-gray-700'}`}>
          {new Date(caiAlert.expiryDate).toLocaleDateString('es-HN')} · {caiAlert.daysUntilExpiry} días
        </span>
      </div>
      {c.isRunningOut && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} /> Quedan pocos correlativos — gestiona un nuevo CAI
        </p>
      )}
    </div>
  )
}
