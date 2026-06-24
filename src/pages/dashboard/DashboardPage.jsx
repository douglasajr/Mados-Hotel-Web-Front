import { useQuery } from '@tanstack/react-query'
import { getDashboardApi } from '../../api/dashboard.api'
import { useAuthStore } from '../../store/auth.store'
import { Building2, BedDouble, TrendingUp, AlertTriangle, CreditCard, Users } from 'lucide-react'
import {
  StatCard, RoomsCard, SalesCard, LowStockCard,
  PendingInvoicesCard, TopSellingCard, CompaniesAlertCard, CaiAlert,
  BillingCard, CaiStatusCard,
  formatLPS,
} from './DashboardCards'

// ── Dashboard por hotel (ADMIN) ──────────────────────────────────────────────
const HotelDashboard = ({ data }) => (
  <div className="space-y-6">
    <CaiAlert caiAlert={data.caiAlert} />
    <CompaniesAlertCard companies={data.companiesNearLimit} />

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Ocupación" value={`${data.rooms.occupancyRate}%`} subtitle={`${data.rooms.occupied} de ${data.rooms.total} habitaciones`} icon={BedDouble} color="bg-blue-600" />
      <StatCard title="Ventas hoy" value={formatLPS(data.sales.today.total)} subtitle="Total del día" icon={TrendingUp} color="bg-green-600" />
      <StatCard title="Por cobrar" value={formatLPS(data.pendingInvoices.total)} subtitle={`${data.pendingInvoices.count} factura${data.pendingInvoices.count !== 1 ? 's' : ''} a crédito`} icon={CreditCard} color="bg-red-500" />
      <StatCard title="Check-ins hoy" value={data.reservationsToday.checkIns} subtitle={`${data.reservationsToday.checkOuts} check-outs pendientes`} icon={Users} color="bg-purple-600" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <BillingCard billing={data.billing} />
      <CaiStatusCard caiAlert={data.caiAlert} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <RoomsCard rooms={data.rooms} />
      <SalesCard sales={data.sales} />
      <LowStockCard lowStock={data.lowStock} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <PendingInvoicesCard pendingInvoices={data.pendingInvoices} />
      <TopSellingCard topProducts={data.topProducts} topMenuItems={data.topMenuItems} />
    </div>
  </div>
)

// ── Dashboard global (SUPERADMIN) ────────────────────────────────────────────
const GlobalDashboard = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Ocupación global" value={`${data.global.rooms.occupancyRate}%`} subtitle={`${data.global.rooms.occupied} de ${data.global.rooms.total} habitaciones`} icon={BedDouble} color="bg-blue-600" />
      <StatCard title="Ventas del mes" value={formatLPS(data.global.sales.month.total)} subtitle="Todos los hoteles" icon={TrendingUp} color="bg-green-600" />
      <StatCard title="Stock bajo" value={data.global.totalLowStock} subtitle="En todos los hoteles" icon={AlertTriangle} color="bg-yellow-500" />
      <StatCard title="Crédito pendiente" value={formatLPS(data.global.pendingInvoices.total)} subtitle={`${data.global.pendingInvoices.count} facturas`} icon={CreditCard} color="bg-red-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SalesCard sales={data.global.sales} />
      <BillingCard billing={data.global.billing} />
    </div>

    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">Detalle por hotel</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {data.hotels.map(({ hotel, rooms, sales, lowStock, caiAlert }) => (
          <div key={hotel.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{hotel.name}</p>
                <p className="text-xs text-gray-400">{hotel.city}</p>
              </div>
            </div>

            <CaiAlert caiAlert={caiAlert} />

            <div className="space-y-3 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ocupación</span>
                <span className="font-semibold">{rooms.occupancyRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${rooms.occupancyRate}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-green-50 rounded-lg p-2 text-center"><p className="font-bold text-green-700">{rooms.available}</p><p className="text-xs text-green-600">Disponibles</p></div>
                <div className="bg-blue-50 rounded-lg p-2 text-center"><p className="font-bold text-blue-700">{rooms.occupied}</p><p className="text-xs text-blue-600">Ocupadas</p></div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ventas del mes</span>
                  <span className="font-semibold text-gray-900">{formatLPS(sales.month.total)}</span>
                </div>
                {lowStock.count > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-yellow-600 text-xs">
                    <AlertTriangle size={13} />{lowStock.count} productos con stock bajo
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// ── Página principal ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore(s => s.user)

  const { data, isLoading, error } = useQuery({
    // La caché se separa por rol: el dashboard global (SUPERADMIN) y el de hotel
    // (ADMIN) tienen formas distintas. Sin esto, la caché de un rol podía servirse
    // al otro y provocar un crash de render (pantalla en blanco tras login).
    queryKey: ['dashboard', user?.role],
    queryFn: getDashboardApi,
    refetchInterval: 60000
  })

  if (isLoading) return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        Error: {error.message}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{data?.global ? 'Dashboard Global' : 'Dashboard'}</h1>
        <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      {/* Se decide por la FORMA de los datos, no por el rol: el dashboard global
          trae `data.global`. Así nunca se renderiza el componente equivocado con
          datos incompatibles (lo que dejaba la pantalla en blanco). */}
      {data && (data.global ? <GlobalDashboard data={data} /> : <HotelDashboard data={data} />)}
    </div>
  )
}
