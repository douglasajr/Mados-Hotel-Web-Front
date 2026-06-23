export const DOCUMENT_TYPE_LABELS = {
  INVOICE:          'Factura',
  CONSUMER_RECEIPT: 'Recibo Consumidor',
}

export const BILLED_TO_LABELS = {
  GUEST:   'Huésped',
  COMPANY: 'Empresa',
}

export const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  PAID:    { label: 'Pagada',    class: 'bg-green-100 text-green-700 hover:bg-green-100' },
  CREDIT:  { label: 'Crédito',   class: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  OVERDUE: { label: 'Vencida',   class: 'bg-red-100 text-red-700 hover:bg-red-100' },
}

export const PAYMENT_METHOD_LABELS = {
  CASH:        'Efectivo',
  CARD:        'Tarjeta',
  TRANSFER:    'Transferencia',
  CREDIT:      'Crédito',
  ROOM_CHARGE: 'Cargo a habitación',
  INTERNAL:    'Interno (nómina)',
}

export const formatLPS = (n) =>
  `L. ${Number(n).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`

export const ISV_TYPE_LABELS = {
  ROOM:      'Habitación (19%)',
  FOOD:      'Restaurante (15%)',
  RECEPTION: 'Recepción (15%)',
  EXENTO:    'Exento',
}

export const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER', 'CREDIT', 'ROOM_CHARGE']

export const CUSTOMER_TYPES = {
  CONSUMER: 'CONSUMER',
  GUEST:    'GUEST',
  COMPANY:  'COMPANY',
}
