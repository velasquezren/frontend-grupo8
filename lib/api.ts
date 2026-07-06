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

// --- Helpers para persistir el tipo de cuenta localmente ---
function getAccountType(id: string): 'ahorro' | 'corriente' {
  if (typeof window === 'undefined') return 'corriente'
  try {
    const data = localStorage.getItem('banca-account-types')
    if (data) {
      const map = JSON.parse(data)
      if (map[id]) return map[id]
    }
  } catch (e) {
    console.error('Error leyendo banca-account-types:', e)
  }
  
  // Fallback determinista basado en el ID
  const lastChar = id?.slice(-1) || '0'
  const isDigit = /[0-9]/.test(lastChar)
  const isEven = isDigit && Number(lastChar) % 2 === 0
  return isEven ? 'corriente' : 'ahorro'
}

function saveAccountType(id: string, tipo: 'ahorro' | 'corriente'): void {
  if (typeof window === 'undefined') return
  try {
    const data = localStorage.getItem('banca-account-types')
    const map = data ? JSON.parse(data) : {}
    map[id] = tipo
    localStorage.setItem('banca-account-types', JSON.stringify(map))
  } catch (e) {
    console.error('Error guardando banca-account-types:', e)
  }
}

function mapBackendAccount(raw: any): Account {
  const ownerName = raw.owner || raw.holder || 'Titular'
  const accountId = raw.id
  return {
    id: accountId,
    titular: ownerName,
    email: `${ownerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    numeroCuenta: `0010-${accountId?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || '0000'}`,
    tipo: getAccountType(accountId),
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

  async createAccount(dto: { titular: string; saldo: number; tipo?: 'ahorro' | 'corriente' }): Promise<Account> {
    const ownerName = (dto.titular || '').trim()
    const balanceNum = Number(dto.saldo) || 0
    if (!ownerName) {
      throw new Error('El nombre del titular es requerido')
    }
    const data = await fetchJSON<any>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ owner: ownerName, balance: balanceNum }),
    })
    
    // Si se especificó el tipo de cuenta, lo guardamos localmente
    if (dto.tipo && data.id) {
      saveAccountType(data.id, dto.tipo)
    }

    return mapBackendAccount(data)
  },

  async updateAccount(id: string, dto: { titular?: string; saldo?: number; tipo?: 'ahorro' | 'corriente' }): Promise<Account> {
    const body: any = {}
    if (dto.titular !== undefined) body.owner = dto.titular.trim()
    if (dto.saldo !== undefined) body.balance = Number(dto.saldo) || 0
    const data = await fetchJSON<any>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    // Si se especificó el tipo de cuenta, lo actualizamos localmente
    if (dto.tipo) {
      saveAccountType(id, dto.tipo)
    }

    return mapBackendAccount(data)
  },

  async deleteAccount(id: string): Promise<{ deleted: boolean; id: string }> {
    return fetchJSON(`/accounts/${id}`, { method: 'DELETE' })
  },

  // Transferencias
  async getTransfers(): Promise<Transfer[]> {
    try {
      const data = await fetchJSON<any[]>('/accounts/transfers')
      if (Array.isArray(data)) return data.map(mapBackendTransfer)
      return []
    } catch {
      return []
    }
  },

  async createTransfer(dto: {
    fromAccountId: string
    toAccountId: string
    amount: number
  }): Promise<Transfer> {
    const data = await fetchJSON<any>('/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    return {
      id: data.transferId || `tx-${Date.now()}`,
      cuentaOrigenId: dto.fromAccountId,
      cuentaDestinoId: dto.toAccountId,
      cuentaOrigen: dto.fromAccountId,
      cuentaDestino: dto.toAccountId,
      titularOrigen: dto.fromAccountId,
      titularDestino: dto.toAccountId,
      monto: Number(dto.amount),
      moneda: 'BOB',
      concepto: 'Transferencia',
      estado: data.status === 'processing' ? 'procesando' : 'completada',
      fechaCreacion: new Date().toISOString(),
    }
  },

  // Alertas — derivadas de las transferencias procesadas por el microservicio NATS
  // El backend no expone un endpoint REST de alertas; el worker NATS solo escribe logs a CloudWatch.
  async getAlerts(): Promise<Alert[]> {
    try {
      const transfers = await this.getTransfers()
      const { generateAlertsFromTransfers } = await import('@/lib/alerts')
      return generateAlertsFromTransfers(transfers)
    } catch {
      return []
    }
  },

  // Health check
  async healthcheck(): Promise<{ status: string }> {
    try {
      return await fetchJSON('/accounts/health')
    } catch {
      return { status: 'offline' }
    }
  },
}
