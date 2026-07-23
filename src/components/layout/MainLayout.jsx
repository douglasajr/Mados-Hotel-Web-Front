import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "../../store/auth.store";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  UtensilsCrossed,
  Package,
  Building2,
  FileText,
  UserCog,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  CreditCard,
  Hotel,
  ArrowLeftRight,
  Clock,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { switchHotelApi } from "../../api/auth.api";

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  CASHIER: "Cajero",
  WAITER: "Mesero",
};

const ROLE_COLORS = {
  SUPERADMIN: "from-purple-500 to-purple-600",
  ADMIN: "from-amber-500 to-orange-500",
  RECEPTIONIST: "from-emerald-500 to-emerald-600",
  CASHIER: "from-blue-500 to-blue-600",
  WAITER: "from-rose-500 to-rose-600",
};

// Menú agrupado por intención: "Operar" (acciones/crear) vs "Consultar" (tablas)
// vs "Sistema" (administración). Cada módulo tendrá su entrada de acción y/o su
// entrada de consulta según se vaya migrando al patrón.
const navGroups = [
  {
    title: null, // sin encabezado — la portada
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["SUPERADMIN", "ADMIN"] },
    ],
  },
  {
    title: "Operar",
    items: [
      { to: "/invoices/new", icon: ShoppingCart, label: "Crear factura", roles: ["SUPERADMIN", "ADMIN", "CASHIER", "RECEPTIONIST"] },
      { to: "/reservations", icon: CalendarCheck, label: "Reservaciones", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST"] },
      { to: "/rooms", icon: BedDouble, label: "Habitaciones", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST"] },
      { to: "/room-charges", icon: CreditCard, label: "Room Charged", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST", "CASHIER"] },
      { to: "/shifts", icon: Clock, label: "Cierre de Turno", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST"] },
      { to: "/cash-collections", icon: DollarSign, label: "Recolección", roles: ["SUPERADMIN", "ADMIN", "CASHIER"] },
    ],
  },
  {
    title: "Consultar",
    items: [
      { to: "/invoices", icon: FileText, label: "Ver facturas", roles: ["SUPERADMIN", "ADMIN", "CASHIER", "RECEPTIONIST"] },
      { to: "/guests", icon: Users, label: "Huéspedes", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST"] },
      { to: "/companies", icon: Building2, label: "Empresas", roles: ["SUPERADMIN", "ADMIN", "RECEPTIONIST", "CASHIER"] },
      { to: "/inventory", icon: Package, label: "Inventario", roles: ["SUPERADMIN", "ADMIN"] },
      { to: "/restaurant", icon: UtensilsCrossed, label: "Menú", roles: ["SUPERADMIN", "ADMIN"] },
      { to: "/reports", icon: BarChart3, label: "Reportes SAR", roles: ["SUPERADMIN", "ADMIN"] },
    ],
  },
  {
    title: "Sistema",
    items: [
      { to: "/users", icon: UserCog, label: "Usuarios", roles: ["SUPERADMIN", "ADMIN"] },
      { to: "/hotels", icon: Hotel, label: "Hoteles", roles: ["SUPERADMIN"] },
    ],
  },
];

function SidebarContent({
  collapsed,
  sections,
  user,
  initials,
  roleGradient,
  onNavClick,
  onLogout,
  onFullLogout,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center border-b border-white/[0.07] transition-all duration-300
                       ${collapsed ? "px-3 py-5 justify-center" : "px-5 py-5 gap-3"}`}
      >
        <img
          src="/mados-logo.png"
          alt="logo"
          className="w-8 h-8 shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p
              className="text-sm font-bold leading-tight whitespace-nowrap
                          bg-linear-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
            >
              Mados Hotel
            </p>
            <p className="text-[0.65rem] text-white/40 truncate max-w-[130px]">
              {user?.hotelName ?? "Sistema de Gestión"}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {sections.map((section, si) => (
          <div key={section.title ?? si} className={si > 0 ? "pt-3" : ""}>
            {section.title && !collapsed && (
              <p className="px-3 mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/25">
                {section.title}
              </p>
            )}
            {section.items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-[0.82rem] font-medium
               transition-all duration-150 group relative
               ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
               ${
                 isActive
                   ? "bg-linear-to-r from-amber-500/20 to-orange-500/10 text-amber-400"
                   : "text-white/40 hover:text-white/90 hover:bg-white/5"
               }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2
                                   w-0.5 h-5 bg-amber-400 rounded-r-full"
                  />
                )}

                <Icon size={17} className="shrink-0" />

                {!collapsed && <span className="truncate">{label}</span>}

                {collapsed && (
                  <span
                    className="absolute left-full ml-3 px-2.5 py-1.5
                                   bg-[#1c1810] border border-amber-500/20 text-white
                                   text-xs rounded-lg whitespace-nowrap shadow-xl
                                   opacity-0 pointer-events-none group-hover:opacity-100
                                   transition-opacity z-50"
                  >
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-white/[0.07] p-3 space-y-1">
        <div
          className={`flex items-center gap-2.5 rounded-xl p-2
                         ${collapsed ? "justify-center" : ""}`}
        >
          <div
            className={`shrink-0 w-8 h-8 rounded-full bg-linear-to-br ${roleGradient}
                           flex items-center justify-center text-white text-xs font-bold shadow-md`}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[0.8rem] font-semibold text-white/90 truncate leading-tight">
                {user?.username}
              </p>
              <p className="text-[0.65rem] text-white/35 truncate">
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center gap-2.5 w-full rounded-xl px-2 py-2
                       text-white/35 hover:text-red-400 hover:bg-red-500/10
                       text-[0.8rem] transition-all duration-150
                       ${collapsed ? "justify-center" : ""}`}
        >
          {user?.role === "SUPERADMIN"
            ? <ArrowLeftRight size={15} className="shrink-0" />
            : <LogOut size={15} className="shrink-0" />
          }
          {!collapsed && (
            <span>{user?.role === "SUPERADMIN" ? "Cambiar hotel" : "Cerrar sesión"}</span>
          )}
        </button>

        {user?.role === "SUPERADMIN" && !collapsed && (
          <button
            onClick={onFullLogout}
            className="flex items-center gap-2.5 w-full rounded-xl px-2 py-1.5
                       text-white/20 hover:text-red-400/70 hover:bg-red-500/5
                       text-[0.72rem] transition-all duration-150"
          >
            <LogOut size={13} className="shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { user, logout, prepareHotelSwitch } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => item.roles.includes(user?.role)) }))
    .filter((g) => g.items.length > 0);
  const initials = user?.username?.[0]?.toUpperCase() ?? "?";
  const roleGradient =
    ROLE_COLORS[user?.role] ?? "from-amber-500 to-orange-500";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSwitchHotel = async () => {
    try {
      const data = await switchHotelApi();
      prepareHotelSwitch(data.tempToken, data.hotels);
      navigate("/select-hotel");
    } catch {
      toast.error("Error al cambiar hotel");
    }
  };

  const sidebarProps = {
    collapsed,
    sections,
    user,
    initials,
    roleGradient,
    onNavClick: () => setMobileOpen(false),
    onLogout: user?.role === "SUPERADMIN" ? handleSwitchHotel : handleLogout,
    onFullLogout: handleLogout,
  };

  return (
    <>
      <div className="flex h-screen bg-[#f5f4f0] overflow-hidden">
        {/* ── Sidebar desktop ── */}
        <aside
          className={`hidden md:flex flex-col shrink-0 bg-[#111008]
                       transition-all duration-300 ease-in-out relative
                       ${collapsed ? "w-[60px]" : "w-[220px]"}`}
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 40% at 50% 0%,
              rgba(245,158,11,0.08) 0%, transparent 70%)`,
          }}
        >
          <SidebarContent {...sidebarProps} />

          {/* Botón colapsar */}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="absolute -right-3 top-[72px] w-6 h-6 rounded-full
                       bg-[#1c1810] border border-amber-500/30 text-amber-500/70
                       flex items-center justify-center shadow-md z-10
                       hover:text-amber-400 hover:border-amber-400 transition-all"
          >
            <ChevronLeft
              size={13}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </aside>

        {/* ── Overlay mobile ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar mobile ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-[#111008]
                       flex flex-col md:hidden transition-transform duration-300
                       ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 40% at 50% 0%,
              rgba(245,158,11,0.08) 0%, transparent 70%)`,
          }}
        >
          <SidebarContent {...sidebarProps} collapsed={false} />
        </aside>

        {/* ── Contenido principal ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar mobile */}
          <header
            className="md:hidden flex items-center justify-between
                              px-4 py-3 bg-white border-b border-gray-200 shrink-0"
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="text-gray-500"
            >
              <Menu size={22} />
            </button>
            <span
              className="text-sm font-bold bg-linear-to-r from-amber-500 to-orange-500
                             bg-clip-text text-transparent"
            >
              Mados Hotel
            </span>
            <div
              className={`w-7 h-7 rounded-full bg-linear-to-br ${roleGradient}
                             flex items-center justify-center text-white text-xs font-bold`}
            >
              {initials}
            </div>
          </header>

          <main className="flex-1 overflow-auto flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>

      <Toaster richColors position="top-right" />
    </>
  );
}
