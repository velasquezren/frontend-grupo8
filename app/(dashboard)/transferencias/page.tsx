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
        <StatCard title="Total Transferido" value={formatCurrency(totalTransferred)} icon={ArrowLeftRight} className="hover:border-primary/20 transition-all duration-300" />
        <StatCard title="Completadas" value={String(completedCount)} icon={CheckCircle2} className="hover:border-primary/20 transition-all duration-300" />
        <StatCard title="Rechazadas" value={String(rejectedCount)} icon={XCircle} className="hover:border-primary/20 transition-all duration-300" />
        <StatCard title="Límite Alerta" value={formatCurrency(MONTO_ALERTA_ELEVADO)} icon={AlertTriangle} description="Montos elevados" className="hover:border-primary/20 transition-all duration-300" />
      </div>

      <Tabs defaultValue="nueva" className="space-y-6">
        <TabsList>
          <TabsTrigger value="nueva">Nueva Transferencia</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* New Transfer Form */}
        <TabsContent value="nueva">
          <Card className="backdrop-blur-md shadow-lg">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Realizar Transferencia
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Selecciona las cuentas y el monto. Se validará el saldo disponible antes de procesar.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuenta de Origen</Label>
                    <Select value={origenId} onValueChange={(v) => setOrigenId(v || '')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cuenta de origen" /></SelectTrigger>
                      <SelectContent>
                        {activeAccounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <div className="flex items-center justify-between w-full gap-4 text-sm">
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
                        <span className="font-mono font-semibold text-primary">
                          {formatCurrency(accounts.find((a) => a.id === origenId)?.saldo ?? 0)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuenta de Destino</Label>
                    <Select value={destinoId} onValueChange={(v) => setDestinoId(v || '')}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar cuenta de destino" /></SelectTrigger>
                      <SelectContent>
                        {activeAccounts
                          .filter((a) => a.id !== origenId)
                          .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex items-center justify-between w-full gap-4 text-sm">
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
                    <Label htmlFor="monto" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto (BOB)</Label>
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
                      <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                        Este monto generará una alerta de monto elevado (≥ {formatCurrency(MONTO_ALERTA_ELEVADO)})
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concepto</Label>
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
                  className="shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all hover:scale-[1.01]"
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
          <Card className="backdrop-blur-md shadow-lg">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-base font-bold tracking-tight">Historial de Transferencias</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Todas las transferencias registradas en la plataforma</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Origen → Destino</TableHead>
                    <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concepto</TableHead>
                    <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((tx) => {
                    const stateConfig = TRANSFER_STATES[tx.estado]
                    const isCompleted = tx.estado === 'completada'
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/50 border-border transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-bold text-foreground">{tx.titularOrigen}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-primary" />
                                {tx.titularDestino}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                          {tx.concepto}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {formatDate(tx.fechaCreacion)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stateConfig.variant} className="relative pl-5 font-medium border-none py-0.5 text-[10px]">
                            <span className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}`}>
                              {isCompleted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>}
                            </span>
                            {stateConfig.label}
                          </Badge>
                          {tx.motivoRechazo && (
                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-[150px] font-mono leading-none">{tx.motivoRechazo}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-bold text-sm text-primary">
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
