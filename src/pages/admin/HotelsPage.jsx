import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Power } from 'lucide-react'
import { getHotelsApi, createHotelApi, updateHotelApi, toggleHotelStatusApi } from '../../api/hotels.api'
import HotelModal from '../../components/hotels/HotelModal'

export default function HotelsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | { hotel?: Hotel }

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: getHotelsApi,
  })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      modal?.hotel
        ? updateHotelApi(modal.hotel.id, payload)
        : createHotelApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotels'] })
      toast.success(modal?.hotel ? 'Hotel actualizado' : 'Hotel creado')
      setModal(null)
    },
    onError: (err) => {
      throw err
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => toggleHotelStatusApi(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotels'] })
      toast.success('Estado del hotel actualizado')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Error al cambiar estado'),
  })

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoteles</h1>
          <p className="text-gray-400 text-sm mt-0.5">Gestiona las sucursales del sistema</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          Nuevo hotel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No hay hoteles registrados
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hotel</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RTN</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ciudad</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {hotels.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{h.name}</p>
                    {h.address && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{h.address}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{h.rtn ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{h.city ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{h.phone ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border
                      ${h.active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${h.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {h.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ hotel: h })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate({ id: h.id, active: !h.active })}
                        disabled={toggleMutation.isPending}
                        className={`p-1.5 rounded-lg transition-colors
                          ${h.active
                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={h.active ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <HotelModal
          hotel={modal.hotel}
          onClose={() => setModal(null)}
          onSave={(payload) => saveMutation.mutateAsync(payload)}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  )
}
