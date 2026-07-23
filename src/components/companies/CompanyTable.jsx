import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, MoreVertical, Pencil, CreditCard, FileText } from "lucide-react";
import Pagination from "../../components/shared/Pagination";

const STATUS_CONFIG = {
  ACTIVE: { label: "Activa", class: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Inactiva", class: "bg-gray-100 text-gray-700" },
  BLOCKED: { label: "Bloqueada", class: "bg-red-100 text-red-700" },
};

export default function CompanyTable({
  companies,
  total,
  page,
  totalPages,
  isAdmin,
  canRegisterPayment,
  readOnly = false,
  onEdit,
  onCredit,
  onReport,
  onToggleStatus,
  onPageChange,
}) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No hay empresas registradas</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>RTN</TableHead>
            <TableHead>Crédito</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const isDebtor = company.hasCredit && Number(company.creditUsed) > 0;
            const debtRatio =
              company.hasCredit && Number(company.creditLimit) > 0
                ? Number(company.creditUsed) / Number(company.creditLimit)
                : 0;

            return (
              <TableRow key={company.id} className={isDebtor ? "bg-red-50/30" : ""}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{company.name}</p>
                        {isDebtor && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold bg-red-100 text-red-700">
                            morosa
                          </span>
                        )}
                      </div>
                      {company.contactName && (
                        <p className="text-xs text-gray-500">{company.contactName}</p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-gray-600 font-mono">
                  {company.rtn}
                </TableCell>

                <TableCell>
                  {company.hasCredit ? (
                    <div className="w-36">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-semibold ${isDebtor ? "text-red-600" : "text-gray-800"}`}
                        >
                          L. {Number(company.creditUsed).toLocaleString("es-HN")}
                        </span>
                        <span className="text-xs text-gray-400">
                          / {Number(company.creditLimit).toLocaleString("es-HN")}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            debtRatio >= 0.9
                              ? "bg-red-500"
                              : debtRatio >= 0.7
                              ? "bg-orange-400"
                              : "bg-blue-400"
                          }`}
                          style={{ width: `${Math.min(debtRatio * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Sin crédito</span>
                  )}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[company.status].class}`}
                  >
                    {STATUS_CONFIG[company.status].label}
                  </span>
                </TableCell>

                <TableCell>
                  {/* En modo consulta solo queda el estado de cuenta: si la
                      empresa no tiene crédito, el menú quedaría vacío. */}
                  {(!readOnly || company.hasCredit) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!readOnly && (
                        <DropdownMenuItem onClick={() => onEdit(company)}>
                          <Pencil size={14} className="mr-2" /> Editar
                        </DropdownMenuItem>
                      )}
                      {!readOnly && company.hasCredit && canRegisterPayment && (
                        <DropdownMenuItem onClick={() => onCredit(company)}>
                          <CreditCard size={14} className="mr-2" /> Registrar abono
                        </DropdownMenuItem>
                      )}
                      {company.hasCredit && (
                        <DropdownMenuItem onClick={() => onReport(company)}>
                          <FileText size={14} className="mr-2" /> Estado de cuenta
                        </DropdownMenuItem>
                      )}
                      {!readOnly && isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          {["ACTIVE", "INACTIVE", "BLOCKED"]
                            .filter((s) => s !== company.status)
                            .map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => onToggleStatus(company.id, s)}
                              >
                                Marcar como {STATUS_CONFIG[s].label}
                              </DropdownMenuItem>
                            ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="border-t border-gray-100 rounded-b-xl px-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {total} empresa{total !== 1 ? "s" : ""} en total
        </p>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
