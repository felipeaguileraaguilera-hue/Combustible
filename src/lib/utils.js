// ═══════════════════════════════════════════════════════════════
// UTILIDADES DE FECHA
// ═══════════════════════════════════════════════════════════════

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

export function toInputDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function toInputDateTime(date = new Date()) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export function todayLocal() {
  return toInputDate(new Date())
}

export function nowLocal() {
  return toInputDateTime(new Date())
}

export function isFutureDate(dateStr) {
  return new Date(dateStr) > new Date()
}

export function formatVolume(liters) {
  return parseFloat(liters).toLocaleString('es-ES', {
    maximumFractionDigits: 1,
  })
}

export function formatCurrency(amount) {
  return parseFloat(amount).toLocaleString('es-ES', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
}
