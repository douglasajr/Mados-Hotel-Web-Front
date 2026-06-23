import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Eye, EyeOff } from "lucide-react";
import { getHotelsApi } from "../../api/hotels.api";
import { useAuthStore } from "../../store/auth.store";

const ROLES = ["ADMIN", "RECEPTIONIST", "CASHIER", "WAITER"];

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  CASHIER: "Cajero",
  WAITER: "Mesero",
};

export function UserModal({ user, onClose, onSave }) {
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === "SUPERADMIN";
  const isEditing = !!user?.id;

  const { data: hotels = [] } = useQuery({
    queryKey: ["hotels"],
    queryFn: getHotelsApi,
    enabled: isSuperAdmin,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "RECEPTIONIST",
    hotelId: user?.hotel?.id ?? "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.username || !form.email || !form.role)
      return setError("Todos los campos son requeridos");
    if (!isEditing && !form.password)
      return setError("La contraseña es requerida");
    if (isSuperAdmin && !form.hotelId)
      return setError("Debes seleccionar un hotel");

    try {
      const dataToSend = { ...form };
      if (isEditing && !form.password) delete dataToSend.password;
      await onSave(dataToSend, user?.id);
      onClose();
    } catch {
      // el error ya lo maneja el hook con toast
    }
  };

  const inputClass = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                      focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel
              </label>
              <select
                value={form.hotelId}
                onChange={set("hotelId")}
                className={inputClass}
              >
                <option value="">Selecciona un hotel</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                className={inputClass}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={form.username}
                onChange={set("username")}
                className={inputClass}
                placeholder="juanperez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              className={inputClass}
              placeholder="juan@hotel.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditing
                ? "Nueva contraseña (dejar vacío para no cambiar)"
                : "Contraseña"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                className={`${inputClass} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={form.role}
              onChange={set("role")}
              className={inputClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-linear-to-r from-amber-500 to-orange-500
                         hover:from-amber-600 hover:to-orange-600
                         text-white py-2 rounded-lg text-sm font-medium transition-all"
            >
              {isEditing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
