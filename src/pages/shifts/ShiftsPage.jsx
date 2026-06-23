import { useState } from 'react'
import { Clock, LogIn, LogOut, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useMyShift, useShifts } from '../../hooks/useShifts'
import ShiftReportModal from '../../components/shifts/ShiftReportModal'

const STATUS_LABEL = { OPEN: 'Abierto', CLOSED: 'Cerrado' }

export default function ShiftsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = ['SUPERADMIN', 'ADMIN'].includes(user?.role)

  const { data: myShift, isLoading: loadingMy } = useMyShift()
  const { shifts, total, page, totalPages, isLoading, setPage, openShift, closeShift, isOpening, isClosing } = useShifts()

  const [reportShiftId, setReportShiftId] = useState(null)
  const [notes, setNotes] = useState('')
  const [showOpen, setShowOpen] = useState(false)

  const handleOpen = async () => {
    await openShift(notes)
    setNotes('')
    setShowOpen(false)
  }

  const handleClose = async () => {
    if (!myShift?.id) return
    if (!window.confirm('¿Cerrar el turno actual?')) return
    const report = await closeShift(myShift.id)
    setReportShiftId(report.shift?.id ?? myShift.id)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cierre de Turno</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestión de turnos del personal de recepción
          </p>
        </div>
      </div>

      {/* Card turno actual */}
      {!loadingMy && (
        <div className={`rounded-2xl p-5 border-2 ${myShift
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${myShift ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Clock size={20} className={myShift ? 'text-green-600' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {myShift ? 'Turno en curso' : 'Sin turno activo'}
                </p>
                {myShift && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Inicio: {new Date(myShift.startTime).toLocaleString('es-HN')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {myShift && (
                <button
                  onClick={() => setReportShiftId(myShift.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200
                             bg-white rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FileText size={14} />
                  Ver reporte
                </button>
              )}

              {myShift ? (
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl
                             bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  <LogOut size={14} />
                  {isClosing ? 'Cerrando...' : 'Cerrar turno'}
                </button>
              ) : (
                <button
                  onClick={() => setShowOpen(true)}
                  disabled={isOpening}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl
                             bg-linear-to-r from-amber-500 to-orange-500 text-white
                             hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                >
                  <LogIn size={14} />
                  Abrir turno
                </button>
              )}
            </div>
          </div>

          {/* Mini form abrir turno */}
          {showOpen && !myShift && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones opcionales..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
              <button
                onClick={handleOpen}
                disabled={isOpening}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white
                           hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {isOpening ? 'Abriendo...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowOpen(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Historial de turnos */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Historial de turnos {isAdmin ? '' : '(propios)'}
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 text-center py-12">
            <Clock size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay turnos registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium">Apertura</th>
                  <th className="text-left px-4 py-3 font-medium">Cierre</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{s.user?.username}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.startTime).toLocaleString('es-HN')}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {s.endTime ? new Date(s.endTime).toLocaleString('es-HN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                        ${s.status === 'OPEN'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setReportShiftId(s.id)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium
                                   flex items-center gap-1 ml-auto"
                      >
                        <FileText size={12} />
                        Reporte
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-500">{total} turno{total !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                               disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-600 px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                               disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal reporte */}
      {reportShiftId && (
        <ShiftReportModal
          shiftId={reportShiftId}
          onClose={() => setReportShiftId(null)}
        />
      )}
    </div>
  )
}
