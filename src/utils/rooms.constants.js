export const ROOM_TYPES = [
  'SENCILLA', 'DOBLE', 'TRIPLE', 'CUADRUPLE',
  'QUINTUPLE', 'SEXTUPLE', 'QUEEN', 'KINGSIZE'
]

export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE']

export const STATUS_CONFIG = {
  AVAILABLE:   { label: 'Disponible',    class: 'bg-green-100 text-green-700 hover:bg-green-100' },
  OCCUPIED:    { label: 'Ocupada',       class: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  CLEANING:    { label: 'Limpieza',      class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  MAINTENANCE: { label: 'Mantenimiento', class: 'bg-red-100 text-red-700 hover:bg-red-100' },
}

export const TYPE_LABELS = {
  SENCILLA:  'Sencilla',
  DOBLE:     'Doble',
  TRIPLE:    'Triple',
  CUADRUPLE: 'Cuádruple',
  QUINTUPLE: 'Quíntuple',
  SEXTUPLE:  'Séxtuple',
  QUEEN:     'Queen',
  KINGSIZE:  'King Size',
}