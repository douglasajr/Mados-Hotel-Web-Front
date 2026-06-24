import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarDays, DollarSign } from 'lucide-react'

const toInputDate = (d) => new Date(d).toLocaleDateString("en-CA")

const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  return Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
}

export default function EditDatesModal({ reservation, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    checkIn: toInputDate(reservation.checkIn),
    checkOut: toInputDate(reservation.checkOut),
  })
  const [priceOverride, setPriceOverride] = useState('')
  const [error, setError] = useState('')

  const nights = calcNights(form.checkIn, form.checkOut)
  const pricePerNight = Number(reservation.room?.pricePerNight ?? 0)
  const calculatedTotal = nights * pricePerNight
  const displayTotal = priceOverride && Number(priceOverride) > 0
    ? Number(priceOverride)
    : calculatedTotal

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.checkIn || !form.checkOut) return setError('Ambas fechas son requeridas')
    if (form.checkOut <= form.checkIn) return setError('El check-out debe ser posterior al check-in')
    try {
      await onSave({
        id: reservation.id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        totalAmountOverride: priceOverride && Number(priceOverride) > 0 ? Number(priceOverride) : undefined,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={16} className="text-amber-500" />
            Editar reservación — Hab. {reservation.room?.number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Check-in</Label>
              <Input
                type="date"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Check-out</Label>
              <Input
                type="date"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
            </div>
          </div>

          {/* Override de precio */}
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <DollarSign size={13} className="text-gray-400" />
              Precio total personalizado
              <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </Label>
            <Input
              type="number"
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
              placeholder={`Calculado: L. ${calculatedTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`}
              className="h-9 text-sm"
            />
            {priceOverride && Number(priceOverride) > 0 && (
              <p className="text-xs text-amber-600">
                Se usará L. {Number(priceOverride).toLocaleString('es-HN', { minimumFractionDigits: 2 })} en lugar del precio calculado
              </p>
            )}
          </div>

          {/* Resumen */}
          {nights > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Noches</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tarifa/noche</span>
                <span className="font-medium">L. {pricePerNight.toLocaleString('es-HN')}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-amber-200">
                <span>Total a cobrar</span>
                <span>L. {displayTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || nights === 0}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
