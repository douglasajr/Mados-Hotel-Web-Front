import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  ChevronDown,
  Settings,
  Menu,
  CreditCard,
  Hotel,
  ArrowLeftRight,
  Clock,
  DollarSign,
  ShoppingCart,
  CalendarPlus,
  Eye,
  UserPlus,
  Plus,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { switchHotelApi } from "../../api/auth.api";

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  CASHIER: "Cajero",
  WAITER: "Mesero",
  WAREHOUSE: "Bodeguero",
};

const ROLE_COLORS = {
  SUPERADMIN: "from-purple-500 to-purple-600",
  ADMIN: "from-amber-500 to-orange-500",
  RECEPTIONIST: "from-emerald-500 to-emerald-600",
  CASHIER: "from-blue-500 to-blue-600",
  WAITER: "from-rose-500 to-rose-600",
  WAREHOUSE: "from-teal-500 to-teal-600",
};

// Menú por módulo. Cada módulo con más de una intención (crear / gestionar /
// ver) es un grupo desplegable; los que tienen una sola pantalla son enlaces
// directos. El grupo del módulo en el que estás se abre solo.
const ALL_STAFF   = ["SUPERADMIN", "ADMIN", "CASHIER", "RECEPTIONIST"];
const FRONT_DESK  = ["SUPERADMIN", "ADMIN", "RECEPTIONIST"];
const ADMIN_ONLY  = ["SUPERADMIN", "ADMIN"];
const WAREHOUSE_STAFF = ["SUPERADMIN", "ADMIN", "WAREHOUSE"];

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ADMIN_ONLY },

  {
    key: "facturas", icon: FileText, label: "Facturas",
    children: [
      { to: "/invoices/new", icon: ShoppingCart, label: "Crear factura", roles: ALL_STAFF },
      { to: "/invoices",     icon: Eye,          label: "Ver facturas",  roles: ALL_STAFF },
    ],
  },
  {
    key: "reservaciones", icon: CalendarCheck, label: "Reservaciones",
    children: [
      { to: "/reservations/nueva", icon: CalendarPlus,  label: "Crear reservación",      roles: FRONT_DESK },
      { to: "/reservations",       icon: CalendarCheck, label: "Gestionar reservaciones", roles: FRONT_DESK },
      { to: "/reservations/ver",   icon: Eye,           label: "Ver reservaciones",       roles: FRONT_DESK },
    ],
  },
  {
    key: "huespedes", icon: Users, label: "Huéspedes",
    children: [
      { to: "/guests/nuevo", icon: UserPlus, label: "Crear huésped", roles: FRONT_DESK },
      { to: "/guests/ver",   icon: Eye,      label: "Ver huéspedes", roles: FRONT_DESK },
    ],
  },
  {
    key: "empresas", icon: Building2, label: "Empresas",
    children: [
      { to: "/companies/nueva", icon: Plus, label: "Crear empresa", roles: ADMIN_ONLY },
      { to: "/companies/ver",   icon: Eye,  label: "Ver empresas",  roles: ALL_STAFF },
    ],
  },

  // Habitaciones tiene una sola pantalla: no necesita desplegable.
  { to: "/rooms",        icon: BedDouble,  label: "Ver habitaciones", roles: FRONT_DESK },
  { to: "/room-charges", icon: CreditCard, label: "Room Charged",     roles: ALL_STAFF },

  {
    key: "caja", icon: DollarSign, label: "Caja",
    children: [
      { to: "/shifts",           icon: Clock,      label: "Cierre de turno", roles: FRONT_DESK },
      { to: "/cash-collections", icon: DollarSign, label: "Recolección",     roles: ["SUPERADMIN", "ADMIN", "CASHIER"] },
    ],
  },

  {
    key: "bodega", icon: PackageCheck, label: "Bodega",
    children: [
      { to: "/warehouse",         icon: PackageCheck, label: "Sacar suministros", roles: WAREHOUSE_STAFF },
      { to: "/warehouse/salidas", icon: Eye,          label: "Ver salidas",       roles: WAREHOUSE_STAFF },
    ],
  },

  { to: "/inventory",  icon: Package,           label: "Inventario",   roles: ADMIN_ONLY },
  { to: "/restaurant", icon: UtensilsCrossed,   label: "Menú",         roles: ADMIN_ONLY },
  { to: "/reports",    icon: BarChart3,         label: "Reportes SAR", roles: ADMIN_ONLY },

  {
    key: "sistema", icon: Settings, label: "Sistema",
    children: [
      { to: "/users",  icon: UserCog, label: "Usuarios", roles: ADMIN_ONLY },
      { to: "/hotels", icon: Hotel,   label: "Hoteles",  roles: ["SUPERADMIN"] },
    ],
  },
];

// Deja solo lo que el rol puede ver, y descarta los grupos que quedan vacíos.
function filterNavByRole(role) {
  const result = [];
  for (const item of navItems) {
    if (item.children) {
      const children = item.children.filter((c) => c.roles.includes(role));
      if (children.length > 0) result.push({ ...item, children });
    } else if (item.roles.includes(role)) {
      result.push(item);
    }
  }
  return result;
}

// Un enlace del menú. `nested` lo dibuja como hijo de un grupo desplegable.
function NavItemLink({ item, collapsed, nested = false, onNavClick }) {
  const { to, icon: Icon, label } = item;
  return (
    <NavLink
      to={to}
      end
      onClick={onNavClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl font-medium
         transition-all duration-150 group relative
         ${nested ? "text-[0.78rem]" : "text-[0.82rem]"}
         ${collapsed ? "px-0 py-2.5 justify-center" : nested ? "pl-9 pr-3 py-2" : "px-3 py-2.5"}
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

          <Icon size={nested ? 15 : 17} className="shrink-0" />

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
  );
}

// Grupo desplegable de un módulo (Facturas, Reservaciones, ...).
// Solo se usa con el sidebar expandido: colapsado no hay dónde desplegar, así
// que ahí el menú se muestra plano (ver SidebarContent).
function NavGroup({ group, isOpen, isActive, onToggle, onNavClick }) {
  const Icon = group.icon;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-[0.82rem] font-medium
                    transition-all duration-150
                    ${isActive ? "text-amber-400" : "text-white/40 hover:text-white/90 hover:bg-white/5"}`}
      >
        <Icon size={17} className="shrink-0" />
        <span className="truncate flex-1 text-left">{group.label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {group.children.map((child) => (
            <NavItemLink
              key={child.to}
              item={child}
              collapsed={false}
              nested
              onNavClick={onNavClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  collapsed,
  sections,
  openGroups,
  onToggleGroup,
  activeGroupKey,
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
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
        {collapsed
          // Colapsado: sin espacio para desplegar, se aplana todo a iconos.
          ? sections
              .flatMap((item) => item.children ?? [item])
              .map((item) => (
                <NavItemLink key={item.to} item={item} collapsed onNavClick={onNavClick} />
              ))
          : sections.map((item) =>
              item.children ? (
                <NavGroup
                  key={item.key}
                  group={item}
                  isOpen={openGroups[item.key] ?? activeGroupKey === item.key}
                  isActive={activeGroupKey === item.key}
                  onToggle={() => onToggleGroup(item.key, activeGroupKey === item.key)}
                  onNavClick={onNavClick}
                />
              ) : (
                <NavItemLink
                  key={item.to}
                  item={item}
                  collapsed={false}
                  onNavClick={onNavClick}
                />
              )
            )}
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
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Solo guarda los grupos que el usuario abrió/cerró a mano. El resto sigue la
  // regla por defecto: abierto si estás dentro de ese módulo.
  const [openGroups, setOpenGroups] = useState({});

  const sections = filterNavByRole(user?.role);

  // Grupo al que pertenece la ruta actual.
  const activeGroupKey = sections.find(
    (item) => item.children?.some((c) => c.to === pathname)
  )?.key ?? null;

  const handleToggleGroup = (key, isActiveGroup) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? isActiveGroup),
    }));
  };

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
    openGroups,
    onToggleGroup: handleToggleGroup,
    activeGroupKey,
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
