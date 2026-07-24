import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Package, Plus, Minus, Trash2, PackageCheck, AlertTriangle, FileText } from "lucide-react";
import { useWarehouseStock, useCreateWarehouseIssue } from "../../hooks/useWarehouse";
import { useAuthStore } from "../../store/auth.store";
import { WAREHOUSE_AREAS, formatQty } from "../../utils/warehouse.constants";
import { buildIssueHtml } from "../../components/warehouse/warehousePrint.template";
import { toast } from "sonner";

// "Sacar suministros": mismo patrón que el carrito de facturas.
// Izquierda = catálogo de bodega (lo que hay). Derecha = carrito + área destino.
export default function WarehousePage() {
  const user = useAuthStore((s) => s.user);
  const { stock, isLoading } = useWarehouseStock();
  const { createIssue, isCreating } = useCreateWarehouseIssue();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [cart, setCart] = useState([]);
  const [area, setArea] = useState(null);
  const [notes, setNotes] = useState("");

  const categories = useMemo(() => {
    const names = new Set(stock.map((item) => item.categoryName));
    return ["ALL", ...[...names].sort((a, b) => a.localeCompare(b, "es"))];
  }, [stock]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return stock.filter((item) => {
      if (category !== "ALL" && item.categoryName !== category) return false;
      if (term && !item.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [stock, search, category]);

  const inCart = (productId) => cart.find((line) => line.productId === productId);

  const addToCart = (item) => {
    const existing = inCart(item.productId);
    const nextQty = (existing?.quantity ?? 0) + 1;

    if (nextQty > item.quantity) {
      toast.error(`Solo hay ${formatQty(item.quantity)} de "${item.name}" en bodega`);
      return;
    }

    if (existing) {
      setCart(cart.map((line) =>
        line.productId === item.productId ? { ...line, quantity: nextQty } : line
      ));
    } else {
      setCart([...cart, { productId: item.productId, name: item.name, quantity: 1, available: item.quantity }]);
    }
  };

  const changeQty = (productId, quantity) => {
    const line = inCart(productId);
    if (!line) return;

    if (quantity <= 0) {
      setCart(cart.filter((l) => l.productId !== productId));
      return;
    }
    if (quantity > line.available) {
      toast.error(`Solo hay ${formatQty(line.available)} disponibles`);
      return;
    }
    setCart(cart.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
  };

  const totalUnits = cart.reduce((sum, line) => sum + Number(line.quantity), 0);

  const handleConfirm = async () => {
    if (!area) return toast.error("Elige el área a la que van los suministros");
    if (cart.length === 0) return toast.error("Agrega al menos un suministro");

    const issue = await createIssue({
      area,
      notes: notes.trim() || undefined,
      items: cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    });

    // Comprobante para firmar: quién entregó, qué y para qué área.
    const w = window.open("", "_blank", "width=850,height=900");
    if (w) {
      w.document.write(buildIssueHtml(issue, user?.hotelName ?? "Hotel Mados"));
      w.document.close();
    }

    setCart([]);
    setArea(null);
    setNotes("");
  };

  return (
    <div className="min-h-full lg:h-full flex flex-col">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <Package size={20} className="text-amber-600" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Sacar suministros</h1>
            <p className="text-xs text-gray-500">Arma el pedido y elige a qué área va</p>
          </div>
        </div>
        <Link
          to="/warehouse/salidas"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                     border border-gray-200 text-gray-600 bg-white
                     hover:border-amber-300 hover:text-amber-600 transition-all"
        >
          <FileText size={14} />
          Ver salidas
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        {/* ── Catálogo de bodega ── */}
        <div className="flex flex-col flex-1 lg:overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="p-3 space-y-2 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar suministro..."
                className="w-full pl-9 pr-3 h-10 text-sm border border-gray-200 rounded-lg bg-white
                           focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                    ${category === name
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-amber-300"}`}
                >
                  {name === "ALL" ? "Todos" : name}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[45vh] lg:h-auto lg:flex-1 overflow-y-auto p-3 pt-0">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                <Package size={36} className="mx-auto mb-2 text-gray-300" />
                {search ? `Sin resultados para "${search}"` : "No hay suministros en bodega"}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => {
                  const line = inCart(item.productId);
                  const isEmpty = item.quantity <= 0;

                  return (
                    <button
                      key={item.productId}
                      type="button"
                      disabled={isEmpty}
                      onClick={() => addToCart(item)}
                      className={`text-left p-3 rounded-xl border transition-all
                        ${isEmpty
                          ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                          : line
                            ? "bg-amber-50 border-amber-300 shadow-sm"
                            : "bg-white border-gray-100 hover:border-amber-300 hover:shadow-sm"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
                        {line && (
                          <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-500 text-white
                                           text-xs font-bold flex items-center justify-center">
                            {formatQty(line.quantity)}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.7rem] text-gray-400 mt-0.5">{item.categoryName}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {item.lowStock && !isEmpty && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                        <span className={`text-xs font-semibold ${item.lowStock ? "text-red-600" : "text-gray-600"}`}>
                          {isEmpty ? "Sin existencia" : `${formatQty(item.quantity)} disponibles`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Carrito ── */}
        <div className="flex flex-col lg:w-[42%] lg:overflow-y-auto bg-white">
          <div className="lg:flex-1 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Pedido {cart.length > 0 && <span className="text-gray-400 font-normal">({cart.length})</span>}
              </p>

              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                  Toca un suministro para agregarlo
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cart.map((line) => (
                    <div key={line.productId} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50/50">
                      <p className="flex-1 text-sm text-gray-800 leading-tight">{line.name}</p>

                      <button
                        type="button"
                        onClick={() => changeQty(line.productId, line.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500
                                   hover:border-amber-400 hover:text-amber-600 flex items-center justify-center transition-all"
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={line.available}
                        value={line.quantity}
                        onChange={(e) => changeQty(line.productId, Number(e.target.value))}
                        className="w-14 h-7 text-center text-sm border border-gray-200 rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => changeQty(line.productId, line.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-500
                                   hover:border-amber-400 hover:text-amber-600 flex items-center justify-center transition-all"
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeQty(line.productId, 0)}
                        className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Área destino — obligatoria */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">
                ¿A dónde va? <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {WAREHOUSE_AREAS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setArea(a.value)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${area === a.value
                        ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                        : `${a.color} hover:opacity-80`}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Observaciones <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: para el evento del sábado"
                maxLength={300}
                className="w-full px-3 h-10 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Pie fijo */}
          <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total de unidades</span>
              <span className="text-xl font-bold text-gray-900">{formatQty(totalUnits)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setCart([]); setArea(null); setNotes(""); }}
                disabled={cart.length === 0}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200
                           text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isCreating || cart.length === 0 || !area}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           text-sm font-semibold text-white transition-all shadow-sm
                           bg-linear-to-r from-amber-500 to-orange-500
                           hover:from-amber-600 hover:to-orange-600
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <PackageCheck size={16} />
                {isCreating ? "Registrando..." : "Confirmar salida"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
