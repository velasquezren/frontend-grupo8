import type { Account, Transfer, Alert } from '@/types'

// URL base del API backend. En produccion, apunta al ALB.
// Se configura via variable de entorno NEXT_PUBLIC_API_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://u5gkfzc94l.execute-api.us-east-1.amazonaws.com'

// --- Helpers internos ---

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText)
    throw new Error(`API Error ${res.status}: ${error}`)
  }
  return res.json()
}

// --- Mappers: Backend -> Frontend ---
// El backend usa { id, holder, balance } mientras que el frontend usa Account con mas campos.

function mapBackendAccount(raw: any): Account {
  return {
    id: raw.id,
    titular: raw.holder,
    email: `${raw.holder?.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    numeroCuenta: `0010-${raw.id?.replace('ACC-', '') || '0000'}`,
    tipo: 'corriente',
    saldo: Number(raw.balance),
    moneda: 'BOB',
    estado: 'activa',
    creadaEn: raw.createdAt || new Date().toISOString(),
  }
}

function mapBackendTransfer(raw: any): Transfer {
  const estadoMap: Record<string, Transfer['estado']> = {
    completed: 'completada',
    failed: 'rechazada',
    pending: 'pendiente',
    processing: 'procesando',
  }
  return {
    id: raw.transferId || raw.id,
    cuentaOrigenId: raw.fromAccountId,
    cuentaDestinoId: raw.toAccountId,
    cuentaOrigen: raw.fromAccountId,
    cuentaDestino: raw.toAccountId,
    titularOrigen: raw.fromAccountId,
    titularDestino: raw.toAccountId,
    monto: Number(raw.amount),
    moneda: 'BOB',
    concepto: raw.concept || 'Transferencia',
    estado: estadoMap[raw.status] || 'pendiente',
    fechaCreacion: raw.createdAt,
    fechaProcesamiento: raw.completedAt,
    motivoRechazo: raw.reason || undefined,
  }
}

// --- API Client ---

export const api = {
  // Cuentas
  async getAccounts(): Promise<Account[]> {
    const data = await fetchJSON<any[]>('/accounts')
    return data.map(mapBackendAccount)
  },

  async getAccount(id: string): Promise<Account> {
    const data = await fetchJSON<any>(`/accounts/${id}`)
    return mapBackendAccount(data)
  },

  async createAccount(dto: { titular: string; saldo: number }): Promise<Account> {
    const data = await fetchJSON<any>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ holder: dto.titular, balance: dto.saldo }),
    })
    return mapBackendAccount(data)
  },

  async updateAccount(id: string, dto: { titular?: string; saldo?: number }): Promise<Account> {
    const body: any = {}
    if (dto.titular !== undefined) body.holder = dto.titular
    if (dto.saldo !== undefined) body.balance = dto.saldo
    const data = await fetchJSON<any>(`/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return mapBackendAccount(data)
  },

  async deleteAccount(id: string): Promise<{ deleted: boolean; id: string }> {
    return fetchJSON(`/accounts/${id}`, { method: 'DELETE' })
  },

  // Transferencias
  async getTransfers(): Promise<Transfer[]> {
    const data = await fetchJSON<any[]>('/accounts/transfers')
    return data.map(mapBackendTransfer)
  },

  async createTransfer(dto: {
    fromAccountId: string
    toAccountId: string
    amount: number
  }): Promise<Transfer> {
    const data = await fetchJSON<any>('/accounts/transfers', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    return mapBackendTransfer(data)
  },

  // Alertas
  async getAlerts(): Promise<Alert[]> {
    return fetchJSON<Alert[]>('/accounts/alerts')
  },

  // Health check
  async healthcheck(): Promise<{ status: string; database: string; ping: string }> {
    return fetchJSON('/accounts/status/healthcheck')
  },
}
