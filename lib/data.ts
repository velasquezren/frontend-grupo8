import type { Account, Transfer, Movement, Alert } from '@/types'

// --- MOCK DATA ---

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    titular: 'Juan Pérez',
    email: 'juan@email.com',
    numeroCuenta: '0010-0001-4532',
    tipo: 'ahorro',
    saldo: 125450.75,
    moneda: 'BOB',
    estado: 'activa',
    creadaEn: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    titular: 'María González',
    email: 'maria@email.com',
    numeroCuenta: '0010-0002-7891',
    tipo: 'corriente',
    saldo: 45230.0,
    moneda: 'BOB',
    estado: 'activa',
    creadaEn: '2025-02-20T14:30:00Z',
  },
  {
    id: '3',
    titular: 'Carlos Rodríguez',
    email: 'carlos@email.com',
    numeroCuenta: '0010-0003-2156',
    tipo: 'ahorro',
    saldo: 8750.50,
    moneda: 'BOB',
    estado: 'activa',
    creadaEn: '2025-03-10T09:15:00Z',
  },
  {
    id: '4',
    titular: 'Ana Martínez',
    email: 'ana@email.com',
    numeroCuenta: '0010-0004-6543',
    tipo: 'corriente',
    saldo: 320.0,
    moneda: 'BOB',
    estado: 'activa',
    creadaEn: '2025-04-05T16:45:00Z',
  },
  {
    id: '5',
    titular: 'Luis Hernández',
    email: 'luis@email.com',
    numeroCuenta: '0010-0005-9087',
    tipo: 'ahorro',
    saldo: 67890.25,
    moneda: 'BOB',
    estado: 'inactiva',
    creadaEn: '2025-05-12T11:20:00Z',
  },
]

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 'T001',
    cuentaOrigenId: '1',
    cuentaDestinoId: '2',
    cuentaOrigen: '0010-0001-4532',
    cuentaDestino: '0010-0002-7891',
    titularOrigen: 'Juan Pérez',
    titularDestino: 'María González',
    monto: 2500.0,
    moneda: 'BOB',
    concepto: 'Pago de servicios',
    estado: 'completada',
    fechaCreacion: '2026-06-25T14:30:00Z',
    fechaProcesamiento: '2026-06-25T14:30:02Z',
  },
  {
    id: 'T002',
    cuentaOrigenId: '4',
    cuentaDestinoId: '3',
    cuentaOrigen: '0010-0004-6543',
    cuentaDestino: '0010-0003-2156',
    titularOrigen: 'Ana Martínez',
    titularDestino: 'Carlos Rodríguez',
    monto: 500.0,
    moneda: 'BOB',
    concepto: 'Préstamo personal',
    estado: 'rechazada',
    fechaCreacion: '2026-06-25T10:15:00Z',
    motivoRechazo: 'Saldo insuficiente en cuenta de origen',
  },
  {
    id: 'T003',
    cuentaOrigenId: '2',
    cuentaDestinoId: '1',
    cuentaOrigen: '0010-0002-7891',
    cuentaDestino: '0010-0001-4532',
    titularOrigen: 'María González',
    titularDestino: 'Juan Pérez',
    monto: 15000.0,
    moneda: 'BOB',
    concepto: 'Inversión compartida',
    estado: 'completada',
    fechaCreacion: '2026-06-24T09:00:00Z',
    fechaProcesamiento: '2026-06-24T09:00:03Z',
  },
  {
    id: 'T004',
    cuentaOrigenId: '3',
    cuentaDestinoId: '4',
    cuentaOrigen: '0010-0003-2156',
    cuentaDestino: '0010-0004-6543',
    titularOrigen: 'Carlos Rodríguez',
    titularDestino: 'Ana Martínez',
    monto: 750.0,
    moneda: 'BOB',
    concepto: 'Reembolso',
    estado: 'completada',
    fechaCreacion: '2026-06-23T16:45:00Z',
    fechaProcesamiento: '2026-06-23T16:45:01Z',
  },
  {
    id: 'T005',
    cuentaOrigenId: '1',
    cuentaDestinoId: '3',
    cuentaOrigen: '0010-0001-4532',
    cuentaDestino: '0010-0003-2156',
    titularOrigen: 'Juan Pérez',
    titularDestino: 'Carlos Rodríguez',
    monto: 8500.0,
    moneda: 'BOB',
    concepto: 'Compra de equipo',
    estado: 'completada',
    fechaCreacion: '2026-06-22T11:30:00Z',
    fechaProcesamiento: '2026-06-22T11:30:02Z',
  },
]

export const MOCK_MOVEMENTS: Movement[] = [
  {
    id: 'M001',
    cuentaId: '1',
    numeroCuenta: '0010-0001-4532',
    tipo: 'debito',
    monto: 2500.0,
    moneda: 'BOB',
    saldoAnterior: 127950.75,
    saldoNuevo: 125450.75,
    descripcion: 'Transferencia a María González',
    referenciaTransferId: 'T001',
    fecha: '2026-06-25T14:30:02Z',
  },
  {
    id: 'M002',
    cuentaId: '2',
    numeroCuenta: '0010-0002-7891',
    tipo: 'credito',
    monto: 2500.0,
    moneda: 'BOB',
    saldoAnterior: 42730.0,
    saldoNuevo: 45230.0,
    descripcion: 'Transferencia de Juan Pérez',
    referenciaTransferId: 'T001',
    fecha: '2026-06-25T14:30:02Z',
  },
  {
    id: 'M003',
    cuentaId: '1',
    numeroCuenta: '0010-0001-4532',
    tipo: 'credito',
    monto: 15000.0,
    moneda: 'BOB',
    saldoAnterior: 112950.75,
    saldoNuevo: 127950.75,
    descripcion: 'Transferencia de María González',
    referenciaTransferId: 'T003',
    fecha: '2026-06-24T09:00:03Z',
  },
  {
    id: 'M004',
    cuentaId: '2',
    numeroCuenta: '0010-0002-7891',
    tipo: 'debito',
    monto: 15000.0,
    moneda: 'BOB',
    saldoAnterior: 57730.0,
    saldoNuevo: 42730.0,
    descripcion: 'Transferencia a Juan Pérez',
    referenciaTransferId: 'T003',
    fecha: '2026-06-24T09:00:03Z',
  },
  {
    id: 'M005',
    cuentaId: '3',
    numeroCuenta: '0010-0003-2156',
    tipo: 'debito',
    monto: 750.0,
    moneda: 'BOB',
    saldoAnterior: 9500.50,
    saldoNuevo: 8750.50,
    descripcion: 'Transferencia a Ana Martínez',
    referenciaTransferId: 'T004',
    fecha: '2026-06-23T16:45:01Z',
  },
  {
    id: 'M006',
    cuentaId: '4',
    numeroCuenta: '0010-0004-6543',
    tipo: 'credito',
    monto: 750.0,
    moneda: 'BOB',
    saldoAnterior: -430.0,
    saldoNuevo: 320.0,
    descripcion: 'Transferencia de Carlos Rodríguez',
    referenciaTransferId: 'T004',
    fecha: '2026-06-23T16:45:01Z',
  },
  {
    id: 'M007',
    cuentaId: '1',
    numeroCuenta: '0010-0001-4532',
    tipo: 'debito',
    monto: 8500.0,
    moneda: 'BOB',
    saldoAnterior: 121450.75,
    saldoNuevo: 112950.75,
    descripcion: 'Transferencia a Carlos Rodríguez',
    referenciaTransferId: 'T005',
    fecha: '2026-06-22T11:30:02Z',
  },
  {
    id: 'M008',
    cuentaId: '3',
    numeroCuenta: '0010-0003-2156',
    tipo: 'credito',
    monto: 8500.0,
    moneda: 'BOB',
    saldoAnterior: 1000.50,
    saldoNuevo: 9500.50,
    descripcion: 'Transferencia de Juan Pérez',
    referenciaTransferId: 'T005',
    fecha: '2026-06-22T11:30:02Z',
  },
]

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'A001',
    tipo: 'monto_elevado',
    mensaje: 'Transferencia de alto valor: Bs. 15.000,00 de María González a Juan Pérez',
    monto: 15000,
    leida: false,
    fecha: '2026-06-24T09:00:03Z',
  },
  {
    id: 'A002',
    tipo: 'transferencia_completada',
    mensaje: 'Transferencia de Bs. 2.500,00 completada exitosamente',
    monto: 2500,
    leida: false,
    fecha: '2026-06-25T14:30:02Z',
  },
  {
    id: 'A003',
    tipo: 'transferencia_rechazada',
    mensaje: 'Transferencia rechazada: Saldo insuficiente en cuenta de Ana Martínez',
    monto: 500,
    leida: true,
    fecha: '2026-06-25T10:15:00Z',
  },
  {
    id: 'A004',
    tipo: 'monto_elevado',
    mensaje: 'Transferencia de alto valor: Bs. 8.500,00 de Juan Pérez a Carlos Rodríguez',
    monto: 8500,
    leida: true,
    fecha: '2026-06-22T11:30:02Z',
  },
]

// --- HELPER FUNCTIONS ---

export function getAccounts(): Account[] {
  return MOCK_ACCOUNTS
}

export function getAccountById(id: string): Account | undefined {
  return MOCK_ACCOUNTS.find((a) => a.id === id)
}

export function getTransfers(): Transfer[] {
  return MOCK_TRANSFERS
}

export function getMovements(): Movement[] {
  return MOCK_MOVEMENTS
}

export function getAlerts(): Alert[] {
  return MOCK_ALERTS
}

export function getRecentTransfers(limit = 5): Transfer[] {
  return MOCK_TRANSFERS.slice(0, limit)
}

export function getTotalBalance(): number {
  return MOCK_ACCOUNTS
    .filter((a) => a.estado === 'activa')
    .reduce((sum, a) => sum + a.saldo, 0)
}

export function getActiveAccountsCount(): number {
  return MOCK_ACCOUNTS.filter((a) => a.estado === 'activa').length
}

export function getCompletedTransfersCount(): number {
  return MOCK_TRANSFERS.filter((t) => t.estado === 'completada').length
}

export function getUnreadAlertsCount(): number {
  return MOCK_ALERTS.filter((a) => !a.leida).length
}
