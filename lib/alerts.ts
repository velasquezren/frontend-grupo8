import type { Transfer, Alert } from '@/types'
import { MONTO_ALERTA_ELEVADO } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function generateAlertsFromTransfers(transfers: Transfer[]): Alert[] {
  const readAlertIds = getReadAlertIds()
  const alerts: Alert[] = []

  transfers.forEach((tx) => {
    // Si la transferencia está completada
    if (tx.estado === 'completada') {
      // 1. Alerta de transferencia completada general
      alerts.push({
        id: `alert-comp-${tx.id}`,
        tipo: 'transferencia_completada',
        mensaje: `Transferencia de ${formatCurrency(tx.monto)} a ${tx.titularDestino || tx.cuentaDestinoId} procesada exitosamente.`,
        monto: tx.monto,
        leida: readAlertIds.has(`alert-comp-${tx.id}`),
        fecha: tx.fechaProcesamiento || tx.fechaCreacion || new Date().toISOString(),
      })

      // 2. Alerta de monto elevado si aplica
      if (tx.monto >= MONTO_ALERTA_ELEVADO) {
        alerts.push({
          id: `alert-monto-${tx.id}`,
          tipo: 'monto_elevado',
          mensaje: `Se detectó monitoreo de auditoría para transferencia de ${formatCurrency(tx.monto)} a ${tx.titularDestino || tx.cuentaDestinoId}. Monto superior al límite de control (Bs. 5,000).`,
          monto: tx.monto,
          leida: readAlertIds.has(`alert-monto-${tx.id}`),
          fecha: tx.fechaProcesamiento || tx.fechaCreacion || new Date().toISOString(),
        })
      }
    }

    // Si la transferencia está rechazada
    if (tx.estado === 'rechazada') {
      alerts.push({
        id: `alert-rech-${tx.id}`,
        tipo: 'transferencia_rechazada',
        mensaje: `Transferencia de ${formatCurrency(tx.monto)} a ${tx.titularDestino || tx.cuentaDestinoId} rechazada. Motivo: ${tx.motivoRechazo || 'Saldo insuficiente o datos inválidos'}.`,
        monto: tx.monto,
        leida: readAlertIds.has(`alert-rech-${tx.id}`),
        fecha: tx.fechaProcesamiento || tx.fechaCreacion || new Date().toISOString(),
      })
    }
  })

  // Ordenar por fecha de forma descendente (más recientes primero)
  return alerts.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
}

// LocalStorage helpers
export function getReadAlertIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const data = localStorage.getItem('banca-alerts-read')
    if (data) {
      const parsed = JSON.parse(data)
      return new Set(Array.isArray(parsed) ? parsed : [])
    }
  } catch (e) {
    console.error('Error al leer banca-alerts-read del localStorage:', e)
  }
  return new Set()
}

export function markAlertAsRead(id: string): void {
  if (typeof window === 'undefined') return
  try {
    const readSet = getReadAlertIds()
    readSet.add(id)
    localStorage.setItem('banca-alerts-read', JSON.stringify(Array.from(readSet)))
  } catch (e) {
    console.error('Error al guardar banca-alerts-read en localStorage:', e)
  }
}

export function markAllAlertsAsRead(alertIds: string[]): void {
  if (typeof window === 'undefined') return
  try {
    const readSet = getReadAlertIds()
    alertIds.forEach((id) => readSet.add(id))
    localStorage.setItem('banca-alerts-read', JSON.stringify(Array.from(readSet)))
  } catch (e) {
    console.error('Error al marcar todas las alertas como leídas:', e)
  }
}

export function clearReadAlerts(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('banca-alerts-read')
  } catch (e) {
    console.error('Error al limpiar alertas leídas:', e)
  }
}

export function getAlertStats(alerts: Alert[]) {
  const total = alerts.length
  const unread = alerts.filter((a) => !a.leida).length
  const highAmount = alerts.filter((a) => a.tipo === 'monto_elevado').length
  const completed = alerts.filter((a) => a.tipo === 'transferencia_completada').length
  const rejected = alerts.filter((a) => a.tipo === 'transferencia_rechazada').length

  return { total, unread, highAmount, completed, rejected }
}
