import { useState } from "react";
import {
  UserPlus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "../../hooks/useUser";
import { UserModal } from "../../components/users/UserModal";

const ROLE_LABELS = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  CASHIER: "Cajero",
  WAITER: "Mesero",
  WAREHOUSE: "Bodeguero",
};

const ROLE_COLORS = {
  SUPERADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-amber-100 text-amber-700",
  RECEPTIONIST: "bg-emerald-100 text-emerald-700",
  CASHIER: "bg-blue-100 text-blue-700",
  WAITER: "bg-orange-100 text-orange-700",
  WAREHOUSE: "bg-teal-100 text-teal-700",
};

export default function UsersPage() {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const { users, isLoading, handleSave, toggleMutation } = useUsers();

  const filteredUsers = users.filter(
    (u) =>
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABELS[u.role]?.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredUsers.length} de {users.length} usuarios
          </p>
        </div>
        <Button
          onClick={() => setModal("create")}
          className="bg-gradient-to-r from-amber-500 to-orange-500
                     hover:from-amber-600 hover:to-orange-600 text-white border-0"
        >
          <UserPlus size={16} className="mr-2" />
          Nuevo usuario
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          placeholder="Buscar por nombre, usuario o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                                    flex items-center justify-center text-white text-sm font-bold shrink-0"
                    >
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-gray-600">
                  {user.email}
                </TableCell>

                <TableCell>
                  <Badge className={ROLE_COLORS[user.role]}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>

                <TableCell className="text-sm text-gray-600">
                  {user.hotel?.name ?? "—"}
                </TableCell>

                <TableCell>
                  <Badge
                    className={
                      user.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {user.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModal(user)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: user.id,
                          active: !user.active,
                        })
                      }
                      className={`h-8 w-8 p-0 ${
                        user.active
                          ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                          : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={user.active ? "Desactivar" : "Activar"}
                    >
                      {user.active ? (
                        <ToggleRight size={15} />
                      ) : (
                        <ToggleLeft size={15} />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {search
              ? `No se encontraron usuarios con "${search}"`
              : "No hay usuarios registrados"}
          </div>
        )}
      </div>

      {modal && (
        <UserModal
          user={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => handleSave(data, modal?.id)}
        />
      )}
    </div>
  );
}
