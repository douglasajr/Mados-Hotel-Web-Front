import { useMemo, useState } from "react";
import { useMenu } from "../../hooks/useMenu";
import { useAuthStore } from "../../store/auth.store";
import { UtensilsCrossed, Search, Plus, Pencil, Power, MoreVertical } from "lucide-react";
import MenuItemModal from "../../components/restaurant/MenuItemModal";

const AVAIL_FILTERS = [
  { value: "ALL",         label: "Todos" },
  { value: "AVAILABLE",   label: "Disponibles" },
  { value: "UNAVAILABLE", label: "No disponibles" },
];

const formatLPS = (n) =>
  `L. ${Number(n).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RestaurantPage() {
  const user   = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const [menuModal, setMenuModal]     = useState(null);
  const [search, setSearch]           = useState("");
  const [availFilter, setAvailFilter] = useState("ALL");
  const [openMenu, setOpenMenu]       = useState(null);

  const { menuItems, isLoading, createMenuItem, updateMenuItem, toggleAvailability, isCreating, isUpdating } =
    useMenu();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesSearch =
        !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchesAvail =
        availFilter === "ALL" ||
        (availFilter === "AVAILABLE" && item.available) ||
        (availFilter === "UNAVAILABLE" && !item.available);
      return matchesSearch && matchesAvail;
    });
  }, [menuItems, search, availFilter]);

  const handleSave = async (data) => {
    if (menuModal?.id) await updateMenuItem({ id: menuModal.id, ...data });
    else await createMenuItem(data);
    setMenuModal(null);
  };

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category).push(item);
    });
    return map;
  }, [filtered]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} ítem{filtered.length !== 1 ? "s" : ""} · {grouped.size} categoría{grouped.size !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setMenuModal("create")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
          >
            <Plus size={15} />
            Nuevo ítem
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {AVAIL_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setAvailFilter(f.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                availFilter === f.value
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {menuItems.length ? "No se encontraron ítems" : "No hay ítems en el menú"}
          </p>
          {isAdmin && menuItems.length === 0 && (
            <button
              onClick={() => setMenuModal("create")}
              className="mt-3 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Crear primer ítem
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                {category}
              </h2>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100 shrink-0">
                      <UtensilsCrossed size={15} className="text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.invoiceDescription && (
                        <p className="text-xs text-gray-400 truncate">{item.invoiceDescription}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatLPS(item.price)}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        item.available
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.available ? "Disponible" : "No disponible"}
                    </span>
                    {isAdmin && (
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {openMenu === item.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-36">
                              <button
                                onClick={() => { setMenuModal(item); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Pencil size={13} className="text-gray-400" />
                                Editar
                              </button>
                              <button
                                onClick={() => { toggleAvailability({ id: item.id, available: !item.available }); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50"
                              >
                                <Power size={13} className="text-gray-400" />
                                {item.available ? "Deshabilitar" : "Habilitar"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {menuModal && (
        <MenuItemModal
          item={menuModal === "create" ? null : menuModal}
          onClose={() => setMenuModal(null)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
