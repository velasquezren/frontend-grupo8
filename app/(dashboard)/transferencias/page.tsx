'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ArrowLeftRight, Send, CheckCircle2, XCircle,
  AlertTriangle, Clock, ArrowUpRight,
} from 'lucide-react'
import { MOCK_ACCOUNTS, MOCK_TRANSFERS } from '@/lib/data'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { TRANSFER_STATES, MONTO_ALERTA_ELEVADO } from '@/lib/constants'
import type { Account, Transfer } from '@/types'
import { toast } from 'sonner'

export default function TransferenciasPage() {
  useEffect(() => {
    document.title = 'Transferencias | Banca Simplificada'
  }, [])
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)
  const [transfers, setTransfers] = useState<Transfer[]>(MOCK_TRANSFERS)

  // Form state
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const activeAccounts = accounts.filter((a) => a.estado === 'activa')
  const completedCount = transfers.filter((t) => t.estado === 'completada').length
  const rejectedCount = transfers.filter((t) => t.estado === 'rechazada').length
  const totalTransferred = transfers
    .filter((t) => t.estado === 'completada')
    .reduce((s, t) => s + t.monto, 0)

  async function handleTransfer() {
    if (!origenId || !destinoId || !monto || !concepto.trim()) {
      toast.error('Completa todos los campos')
      return
    }
    if (origenId === destinoId) {
      toast.error('La cuenta de origen y destino deben ser diferentes')
      return
    }
    const amount = Number(monto)
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }

    const origen = accounts.find((a) => a.id === origenId)!
    const destino = accounts.find((a) => a.id === destinoId)!

    setIsProcessing(true)

    // Simulate NATS event: transfer.requested → transactions
    await new Promise((r) => setTimeout(r, 1500))

    const newTransfer: Transfer = {
      id: `T${generateId()}`,
      cuentaOrigenId: origenId,
      cuentaDestinoId: destinoId,
      cuentaOrigen: origen.numeroCuenta,
      cuentaDestino: destino.numeroCuenta,
      titularOrigen: origen.titular,
      titularDestino: destino.titular,
      monto: amount,
      moneda: 'BOB',
      concepto: concepto.trim(),
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    }

    // Validate: sufficient balance
    if (origen.saldo < amount) {
      // transfer.failed
      newTransfer.estado = 'rechazada'
      newTransfer.motivoRechazo = 'Saldo insuficiente en cuenta de origen'
      setTransfers((prev) => [newTransfer, ...prev])
      toast.error('Transferencia rechazada', {
        description: `Saldo insuficiente. Disponible: ${formatCurrency(origen.saldo)}, Solicitado: ${formatCurrency(amount)}`,
      })
    } else {
      // transfer.completed
      newTransfer.estado = 'completada'
      newTransfer.fechaProcesamiento = new Date().toISOString()
      setTransfers((prev) => [newTransfer, ...prev])

      // Update balances
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === origenId) return { ...a, saldo: a.saldo - amount }
          if (a.id === destinoId) return { ...a, saldo: a.saldo + amount }
          return a
        })
      )

      toast.success('Transferencia completada', {
        description: `${formatCurrency(amount)} enviados a ${destino.titular}`,
      })

      // Alert for high amounts
      if (amount >= MONTO_ALERTA_ELEVADO) {
        setTimeout(() => {
          toast.warning('Alerta: Monto Elevado', {
            description: `Transferencia de ${formatCurrency(amount)} detectada como monto elevado (≥ ${formatCurrency(MONTO_ALERTA_ELEVADO)})`,
          })
        }, 500)
      }
    }

    // Reset form
    setOrigenId('')
    setDestinoId('')
    setMonto('')
    setConcepto('')
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transferencias"
        description="Envía fondos entre cuentas de la plataforma"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Transferido" value={formatCurrency(totalTransferred)} icon={ArrowLeftRight} />
        <StatCard title="Completadas" value={String(completedCount)} icon={CheckCircle2} />
        <StatCard title="Rechazadas" value={String(rejectedCount)} icon={XCircle} />
        <StatCard title="Límite Alerta" value={formatCurrency(MONTO_ALERTA_ELEVADO)} icon={AlertTriangle} description="Montos elevados" />
      </div>

      <Tabs defaultValue="nueva" className="space-y-6">
        <TabsList>
          <TabsTrigger value="nueva">Nueva Transferencia</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* New Transfer Form */}
        <TabsContent value="nueva">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Realizar Transferencia
              </CardTitle>
              <CardDescription>
                Selecciona las cuentas y el monto. Se validará el saldo disponible antes de procesar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cuenta de Origen</Label>
                    <Select value={origenId} onValueChange={(v) => setOrigenId(v || '')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cuenta de origen" /></SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{a.titular}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {a.numeroCuenta} · {formatCurrency(a.saldo)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {origenId && (
                      <p className="text-xs text-muted-foreground">
                        Saldo disponible:{' '}
                        <span className="font-mono font-semibold">
                          {formatCurrency(accounts.find((a) => a.id === origenId)?.saldo ?? 0)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Cuenta de Destino</Label>
                    <Select value={destinoId} onValueChange={(v) => setDestinoId(v || '')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cuenta de destino" /></SelectTrigger>
                      <SelectContent>
                        {activeAccounts
                          .filter((a) => a.id !== origenId)
                          .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex items-center justify-between w-full gap-4">
                                <span>{a.titular}</span>
                                <span className="text-xs text-muted-foreground font-mono">{a.numeroCuenta}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto (BOB)</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="font-mono text-lg"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                    />
                    {Number(monto) >= MONTO_ALERTA_ELEVADO && (
                      <p className="text-xs text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Este monto generará una alerta de monto elevado
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto">Concepto</Label>
                    <Textarea
                      id="concepto"
                      placeholder="Descripción de la transferencia"
                      value={concepto}
                      onChange={(e) => setConcepto(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  onClick={handleTransfer}
                  disabled={isProcessing || !origenId || !destinoId || !monto}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Realizar Transferencia
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer History */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de Transferencias</CardTitle>
              <CardDescription>Todas las transferencias realizadas en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Origen → Destino</TableHead>
                    <TableHead className="hidden md:table-cell">Concepto</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((tx) => {
                    const stateConfig = TRANSFER_STATES[tx.estado]
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium">{tx.titularOrigen}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" />
                                {tx.titularDestino}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.concepto}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {formatDate(tx.fechaCreacion)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stateConfig.variant}>{stateConfig.label}</Badge>
                          {tx.motivoRechazo && (
                            <p className="text-xs text-destructive mt-1 max-w-[150px]">{tx.motivoRechazo}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-semibold text-sm">
                          {formatCurrency(tx.monto)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
