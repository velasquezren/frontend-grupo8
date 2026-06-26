export interface Account {
  id: string
  titular: string
  email: string
  numeroCuenta: string
  tipo: 'ahorro' | 'corriente'
  saldo: number
  moneda: string
  estado: 'activa' | 'inactiva' | 'bloqueada'
  creadaEn: string
}

export interface Transfer {
  id: string
  cuentaOrigenId: string
  cuentaDestinoId: string
  cuentaOrigen: string    // numero cuenta display
  cuentaDestino: string   // numero cuenta display
  titularOrigen: string
  titularDestino: string
  monto: number
  moneda: string
  concepto: string
  estado: 'completada' | 'pendiente' | 'rechazada' | 'procesando'
  fechaCreacion: string
  fechaProcesamiento?: string
  motivoRechazo?: string
}

export interface Movement {
  id: string
  cuentaId: string
  numeroCuenta: string
  tipo: 'credito' | 'debito'
  monto: number
  moneda: string
  saldoAnterior: number
  saldoNuevo: number
  descripcion: string
  referenciaTransferId?: string
  fecha: string
}

export interface Alert {
  id: string
  tipo: 'monto_elevado' | 'transferencia_completada' | 'transferencia_rechazada'
  mensaje: string
  monto?: number
  leida: boolean
  fecha: string
}
