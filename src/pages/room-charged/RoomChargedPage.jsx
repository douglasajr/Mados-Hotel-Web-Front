import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { useReservationCharges } from "../../hooks/useReservationCharges"
import { getReservationsApi } from "../../api/reservations.api"
import { getMenuApi } from "../../api/menu.api"
import { getProductsApi } from "../../api/inventory.api"
import { formatLPS } from "../../utils/invoices.constants"

const ISV_OPTS = [
  { value: "FOOD",      label: "Comida / Restaurante (15%)" },
  { value: "RECEPTION", label: "Pulpería / Recepción (15%)" },
  { value: "EXENTO",    label: "Exento (0%)" },
]

const ISV_BADGE = {
  FOOD:      { label: "Rest.",  cls: "bg-orange-100 text-orange-600" },
  RECEPTION: { label: "Pulp.",  cls: "bg-blue-100 text-blue-600" },
  EXENTO:    { label: "Exento", cls: "bg-gray-100 text-gray-500" },
  ROOM:      { label: "Hosp.", cls: "bg-purple-100 text-purple-600" },
}

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short" })

function ChargeRow({ charge, onDelete, onIncrement, onDecrement, isUpdating, isRemoving }) {
  const invoiced = !!charge.invoiceId
  const busy     = isUpdating || isRemoving
  const badge    = ISV_BADGE[charge.isvType] ?? ISV_BADGE.RECEPTION

  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${invoiced ? "bg-gray-50/40" : "hover:bg-gray-50/60"}`}>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${badge.cls}`}>
        {badge.label}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${invoiced ? "text-gray-400" : "text-gray-800"}`}>
          {charge.description}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatLPS(charge.unitPrice)} c/u</p>
      </div>

      {invoiced ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] bg-green-50 border border-green-200 text-green-600 font-semibold px-1.5 py-0.5 rounded-full">
            ✓ {charge.invoice?.correlative ?? "Facturado"}
          </span>
          <span className="text-sm font-semibold text-gray-400 w-16 text-right">
            {formatLPS(Number(charge.quantity) * Number(charge.unitPrice))}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button type="button" onClick={onDecrement} disabled={busy}
              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-500 text-sm font-bold leading-none transition-colors disabled:opacity-40">
              −
            </button>
            <span className="w-6 text-center text-sm font-bold text-gray-900">{Number(charge.quantity)}</span>
            <button type="button" onClick={onIncrement} disabled={busy}
              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-purple-50 hover:text-purple-600 flex items-center justify-center text-gray-500 text-sm font-bold leading-none transition-colors disabled:opacity-40">
              +
            </button>
          </div>
          <span className="text-sm font-bold text-gray-900 w-16 text-right">
            {formatLPS(Number(charge.quantity) * Number(charge.unitPrice))}
          </span>
          <button type="button" onClick={() => onDelete(charge.id)} disabled={isRemoving}
            className="w-5 h-5 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 text-base font-bold leading-none transition-colors disabled:opacity-40 shrink-0">
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default function RoomChargedPage() {
  const navigate = useNavigate()
  const [selectedRes, setSelectedRes]     = useState(null)
  const [search, setSearch]               = useState("")
  const [activeTab, setActiveTab]         = useState("menu")
  const [catalogSearch, setCatalogSearch] = useState("")
  const [manualDesc, setManualDesc]       = useState("")
  const [manualQty, setManualQty]         = useState("1")
  const [manualPrice, setManualPrice]     = useState("")
  const [manualIsv, setManualIsv]         = useState("RECEPTION")

  const { data: resData, isLoading: resLoading } = useQuery({
    queryKey: ["checked-in-for-charges"],
    queryFn: () => getReservationsApi({ status: "CHECKED_IN", limit: 100 }),
  })
  const reservations = resData?.data ?? []

  const filteredRes = useMemo(() => {
    const q = search.trim().toLowerCase()
    return !q ? reservations : reservations.filter(r =>
      r.guest?.fullName?.toLowerCase().includes(q) || String(r.room?.number ?? "").includes(q)
    )
  }, [reservations, search])

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items"],
    queryFn: getMenuApi,
    enabled: activeTab === "menu" && !!selectedRes,
  })
  const { data: productsRaw } = useQuery({
    queryKey: ["products-catalog"],
    queryFn: getProductsApi,
    enabled: activeTab === "products" && !!selectedRes,
  })
  const products = Array.isArray(productsRaw) ? productsRaw : []

  const cq = catalogSearch.trim().toLowerCase()
  const filteredMenu = menuItems.filter(i =>
    i.available && (!cq || i.name.toLowerCase().includes(cq) || (i.category ?? "").toLowerCase().includes(cq))
  )
  const filteredProducts = products.filter(p =>
    p.active !== false &&
    Number(p.stock?.[0]?.quantity ?? 0) > 0 &&
    (!cq || p.name.toLowerCase().includes(cq) || (p.category?.name ?? "").toLowerCase().includes(cq))
  )

  const {
    charges, isLoading: chargesLoading, total,
    addCharge, isAdding,
    updateCharge, isUpdating,
    removeCharge, isRemoving,
  } = useReservationCharges(selectedRes?.id)

  const handleAddMenu = (item) =>
    addCharge({ reservationId: selectedRes.id, description: item.name, quantity: 1, unitPrice: Number(item.price), isvType: "FOOD" })

  const handleAddProduct = (p) =>
    addCharge({ reservationId: selectedRes.id, description: p.name, quantity: 1, unitPrice: Number(p.price ?? 0), isvType: "RECEPTION", productId: p.id })

  const handleAddManual = (e) => {
    e.preventDefault()
    if (!manualDesc.trim() || !manualPrice || Number(manualPrice) <= 0) return
    addCharge({ reservationId: selectedRes.id, description: manualDesc.trim(), quantity: Number(manualQty) || 1, unitPrice: Number(manualPrice), isvType: manualIsv })
    setManualDesc(""); setManualPrice(""); setManualQty("1")
  }

  const handleSelectRes = (r) => { setSelectedRes(r); setActiveTab("menu"); setCatalogSearch("") }

  // ── Pantalla de selección ────────────────────────────────────────────────────
  if (!selectedRes) {
    return (
      <div className="flex flex-col h-full bg-[#f7f7f5]">
        <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-gray-900">Consumos por Habitación</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {resLoading ? "Cargando…" : `${reservations.length} habitación${reservations.length !== 1 ? "es" : ""} con check-in activo`}
              </p>
            </div>
            <div className="relative w-60">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Número o huésped…"
                className="w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {resLoading ? (
            <div className="flex justify-center pt-20">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRes.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24 gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-200">
                —
              </div>
              <p className="text-sm text-gray-500 font-medium">
                {search ? "Sin resultados" : "No hay huéspedes activos"}
              </p>
              <p className="text-xs text-gray-400">
                {search ? "Intenta con otro nombre o número de habitación" : "Realiza un check-in para ver habitaciones aquí"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
              {filteredRes.map(r => {
                const allCharges   = r.reservationCharges ?? []
                const pending      = allCharges.filter(c => !c.invoiceId)
                const invoicedC    = allCharges.filter(c => c.invoiceId)
                const nights       = Math.max(1, Math.ceil((new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60 * 24)))
                const hospBilled   = !!r.invoice && !r.invoice.voided
                const hasPending   = pending.length > 0
                const allInvoiced  = allCharges.length > 0 && invoicedC.length === allCharges.length
                const pendingTotal = pending.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0)

                const accentCls = hasPending ? "bg-amber-400" : allInvoiced ? "bg-emerald-400" : "bg-gray-200"
                const borderHover = hasPending ? "hover:border-amber-200" : allInvoiced ? "hover:border-emerald-200" : "hover:border-gray-200"

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRes(r)}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group overflow-hidden flex ${borderHover}`}
                  >
                    {/* Accent strip left */}
                    <div className={`w-1 shrink-0 ${accentCls}`} />

                    <div className="flex-1 p-4 min-w-0">

                      {/* Top row: room number + nights badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">{r.room?.number}</span>
                          {hospBilled && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full leading-none">Hosp. ✓</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{nights}n</span>
                      </div>

                      {/* Guest name */}
                      <p className="text-sm font-semibold text-gray-900 truncate leading-snug mb-1">{r.guest?.fullName}</p>

                      {/* Dates */}
                      <p className="text-xs text-gray-400 mb-4">
                        {fmtDate(r.checkIn)}<span className="mx-1.5 text-gray-300">—</span>{fmtDate(r.checkOut)}
                      </p>

                      {/* Status + amount footer */}
                      <div className="flex items-center justify-between">
                        {hasPending ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-amber-700">{pending.length} pendiente{pending.length !== 1 ? "s" : ""}</span>
                          </div>
                        ) : allInvoiced ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-emerald-700">Todo facturado</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300">Sin cargos</span>
                        )}

                        {hasPending && pendingTotal > 0 && (
                          <span className="text-xs font-bold text-gray-800">{formatLPS(pendingTotal)}</span>
                        )}
                      </div>

                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Pantalla de detalle ──────────────────────────────────────────────────────
  const pending       = charges.filter(c => !c.invoiceId)
  const invoiced      = charges.filter(c => c.invoiceId)
  const pendingTotal  = pending.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0)
  const invoicedTotal = invoiced.reduce((s, c) => s + Number(c.quantity) * Number(c.unitPrice), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <button type="button" onClick={() => setSelectedRes(null)}
          className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors shrink-0">
          ← Habitaciones
        </button>
        <div className="w-px h-4 bg-gray-200 shrink-0" />
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shrink-0">
          {selectedRes.room?.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate leading-tight">{selectedRes.guest?.fullName}</p>
          <p className="text-[10px] text-gray-400">{fmtDate(selectedRes.checkIn)} → {fmtDate(selectedRes.checkOut)}</p>
        </div>
        {charges.length > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400">{charges.length} cargo{charges.length !== 1 ? "s" : ""}</p>
            <p className="text-sm font-bold text-gray-900">{formatLPS(total)}</p>
          </div>
        )}
      </div>

      {/* Dos paneles */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Catálogo ── */}
        <div className="flex flex-col w-[55%] border-r border-gray-100 bg-white overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 shrink-0">
            {[
              { key: "menu",     label: "Restaurante", dot: "bg-orange-400", activeCls: "border-orange-400 text-orange-600 bg-orange-50/20" },
              { key: "products", label: "Pulpería",    dot: "bg-blue-400",   activeCls: "border-blue-400 text-blue-600 bg-blue-50/20" },
              { key: "manual",   label: "Manual",      dot: "bg-gray-400",   activeCls: "border-gray-500 text-gray-600 bg-gray-50/20" },
            ].map(({ key, label, dot, activeCls }) => (
              <button key={key} type="button"
                onClick={() => { setActiveTab(key); setCatalogSearch("") }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === key ? activeCls : "border-transparent text-gray-400 hover:text-gray-600"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === key ? dot : "bg-gray-300"}`} />
                {label}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          {activeTab !== "manual" && (
            <div className="px-3 pt-2.5 pb-1.5 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full pl-7 pr-2 h-8 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "menu" && (
              filteredMenu.length === 0
                ? <p className="text-center text-gray-300 text-xs py-10">Sin platillos disponibles</p>
                : <div className="px-2 py-2">
                    {filteredMenu.map(item => (
                      <button key={item.id} type="button" onClick={() => handleAddMenu(item)}
                        disabled={isAdding}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-left transition-all disabled:opacity-60 group">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">
                          {(item.name?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{item.category ?? "Restaurante"}</p>
                        </div>
                        <span className="text-xs font-bold text-orange-500 shrink-0">{formatLPS(item.price)}</span>
                        <span className="w-6 h-6 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center text-orange-600 text-sm font-bold leading-none transition-colors shrink-0">+</span>
                      </button>
                    ))}
                  </div>
            )}

            {activeTab === "products" && (
              filteredProducts.length === 0
                ? <p className="text-center text-gray-300 text-xs py-10">Sin productos en stock</p>
                : <div className="px-2 py-2">
                    {filteredProducts.map(p => {
                      const stock = Number(p.stock?.[0]?.quantity ?? 0)
                      return (
                        <button key={p.id} type="button" onClick={() => handleAddProduct(p)}
                          disabled={isAdding}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-all disabled:opacity-60 group">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {(p.name?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate leading-tight">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.category?.name ?? "Producto"}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${stock <= 3 ? "bg-red-100 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                            {stock} u.
                          </span>
                          <span className="text-xs font-bold text-blue-500 shrink-0">{formatLPS(p.price ?? 0)}</span>
                          <span className="w-6 h-6 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-600 text-sm font-bold leading-none transition-colors shrink-0">+</span>
                        </button>
                      )
                    })}
                  </div>
            )}

            {activeTab === "manual" && (
              <form onSubmit={handleAddManual} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                  <input value={manualDesc} onChange={e => setManualDesc(e.target.value)}
                    placeholder="Ej: Servicio de lavandería"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                    required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                    <input type="number" min="0.01" step="0.01" value={manualQty}
                      onChange={e => setManualQty(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                      required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Precio unitario</label>
                    <input type="number" min="0" step="0.01" value={manualPrice}
                      onChange={e => setManualPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                      required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Impuesto</label>
                  <select value={manualIsv} onChange={e => setManualIsv(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400 bg-white">
                    {ISV_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isAdding}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60">
                  {isAdding ? "Agregando…" : "Agregar cargo"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Cuenta ── */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[#fafaf8]">
          <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Cuenta</p>
              {charges.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {pending.length} pendiente{pending.length !== 1 ? "s" : ""} · {invoiced.length} facturado{invoiced.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {charges.length > 0 && (
              <span className="text-sm font-bold text-gray-900">{formatLPS(total)}</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {chargesLoading ? (
              <div className="flex justify-center pt-10">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : charges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-light text-gray-300 mb-1 select-none">
                  0
                </div>
                <p className="text-sm text-gray-500 font-medium">Sin cargos todavía</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Agrega platillos, productos o un cargo manual desde el panel izquierdo
                </p>
              </div>
            ) : (
              <div className="bg-white">
                {charges.map(c => (
                  <ChargeRow
                    key={c.id}
                    charge={c}
                    onDelete={removeCharge}
                    onIncrement={() => updateCharge({ id: c.id, body: { quantity: Number(c.quantity) + 1 } })}
                    onDecrement={() => {
                      const qty = Number(c.quantity)
                      if (qty <= 1) removeCharge(c.id)
                      else updateCharge({ id: c.id, body: { quantity: qty - 1 } })
                    }}
                    isUpdating={isUpdating}
                    isRemoving={isRemoving}
                  />
                ))}
              </div>
            )}
          </div>

          {charges.length > 0 && (
            <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0 space-y-2.5">
              {invoiced.length > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-600 font-medium">✓ Facturado ({invoiced.length})</span>
                  <span className="text-emerald-600 font-semibold">{formatLPS(invoicedTotal)}</span>
                </div>
              )}
              {pending.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Por facturar ({pending.length})</span>
                  <span className="text-base font-bold text-gray-900">{formatLPS(pendingTotal)}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate("/invoices/new")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {pending.length > 0 ? "Facturar en POS" : "Ir al POS"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
