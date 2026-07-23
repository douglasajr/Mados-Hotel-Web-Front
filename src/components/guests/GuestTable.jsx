import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Users } from "lucide-react";
import Pagination from "../../components/shared/Pagination";

export default function GuestTable({
  guests,
  total,
  page,
  totalPages,
  readOnly = false,
  onEdit,
  onPageChange,
}) {
  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay huéspedes registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Huésped</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold">
                    {guest.fullName?.[0]?.toUpperCase()}
                  </div>
                  <p className="font-medium text-sm">{guest.fullName}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {guest.documentId ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {guest.company?.name ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {guest.phone ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {guest.email ?? "—"}
              </TableCell>
              <TableCell>
                {!readOnly && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(guest)}>
                    <Pencil size={15} />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="border-t border-gray-100 px-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} huéspedes en total</p>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
