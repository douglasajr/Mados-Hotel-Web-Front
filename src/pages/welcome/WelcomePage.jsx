import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { CalendarCheck, FileText, Users, CreditCard } from "lucide-react";

const ROLE_LABELS = {
  RECEPTIONIST: "Recepcionista",
  CASHIER:      "Cajero",
  WAITER:       "Mesero",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)  return { text: "Buenos días",   emoji: "🌅" };
  if (h >= 12 && h < 19) return { text: "Buenas tardes", emoji: "☀️" };
  return                         { text: "Buenas noches", emoji: "🌙" };
}

const SHORTCUTS = [
  { to: "/reservations", icon: CalendarCheck, label: "Reservaciones", color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
  { to: "/invoices",     icon: FileText,      label: "Facturas",       color: "bg-blue-50 border-blue-200 text-blue-700",   dot: "bg-blue-500"  },
  { to: "/guests",       icon: Users,         label: "Huéspedes",      color: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
  { to: "/room-charges", icon: CreditCard,    label: "Room Charged",   color: "bg-purple-50 border-purple-200 text-purple-700",   dot: "bg-purple-500"  },
];

export default function WelcomePage() {
  const user    = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const greeting = useMemo(getGreeting, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-HN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-0"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 70%), #f5f4f0",
      }}
    >
      {/* Greeting card */}
      <div className="w-full max-w-xl text-center space-y-3 mb-10">

        {/* Emoji + hour */}
        <p className="text-3xl">{greeting.emoji}</p>

        {/* "Buenos días / tardes / noches" + nombre en cursiva Dancing Script */}
        <h1
          style={{ fontFamily: "'Dancing Script', cursive", fontSize: "clamp(2.8rem, 8vw, 5rem)", lineHeight: 1.15 }}
          className="text-gray-800"
        >
          {greeting.text},{" "}
          <span className="text-amber-600">{user?.username}</span>
        </h1>

        {/* Rol + hotel */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full tracking-wide uppercase">
            {ROLE_LABELS[user?.role] ?? user?.role}
          </span>
          {user?.hotelName && (
            <span className="text-gray-400 text-sm">&middot; {user.hotelName}</span>
          )}
        </div>

        {/* Fecha */}
        <p className="text-sm text-gray-400 capitalize pt-1">{dateStr}</p>
      </div>

      {/* Divisor */}
      <div className="w-24 h-px bg-amber-200 mb-8" />

      {/* Accesos rápidos */}
      <div className="w-full max-w-xl">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map(({ to, icon: Icon, label, color, dot }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${color}
                          text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
              <Icon size={16} className="shrink-0 opacity-70" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
