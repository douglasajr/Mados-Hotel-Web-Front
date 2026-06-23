import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const FIELD = ({ label, name, value, onChange, placeholder, required }) => (
  <div className="space-y-1.5">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
      {!required && <span className="ml-1 normal-case font-normal text-gray-400">(opcional)</span>}
    </p>
    <input
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
    />
  </div>
)

export default function HotelModal({ hotel, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: hotel?.name ?? '',
    rtn: hotel?.rtn ?? '',
    address: hotel?.address ?? '',
    city: hotel?.city ?? '',
    phone: hotel?.phone ?? '',
  })
  const [error, setError] = useState('')

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('El nombre es requerido')
    if (!form.rtn.trim()) return setError('El RTN es requerido')
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {hotel ? 'Editar hotel' : 'Nuevo hotel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <FIELD label="Nombre" name="name" value={form.name} onChange={set} placeholder="Nombre del hotel" required />
          <FIELD label="RTN" name="rtn" value={form.rtn} onChange={set} placeholder="0000-0000-000000" required />

          <div className="grid grid-cols-2 gap-3">
            <FIELD label="Ciudad" name="city" value={form.city} onChange={set} placeholder="Tegucigalpa" />
            <FIELD label="Teléfono" name="phone" value={form.phone} onChange={set} placeholder="2222-3333" />
          </div>

          <FIELD label="Dirección" name="address" value={form.address} onChange={set} placeholder="Colonia, calle, número..." />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-9 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : hotel ? 'Actualizar' : 'Crear hotel'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
