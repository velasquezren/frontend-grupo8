'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ArrowLeftRight, Send, CheckCircle2, XCircle,
  AlertTriangle, Clock, ArrowUpRight, Cpu, User,
  Coins, Check, Printer, Download, RefreshCw, Search
} from 'lucide-react'
import { cn, formatCurrency, formatDate, generateId } from '@/lib/utils'
import { TRANSFER_STATES, MONTO_ALERTA_ELEVADO } from '@/lib/constants'
import type { Account, Transfer } from '@/types'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface TransferenciasClientProps {
  initialAccounts: Account[]
  initialTransfers: Transfer[]
}

type FormStep = 'form' | 'processing' | 'receipt'

export function TransferenciasClient({ initialAccounts = [], initialTransfers = [] }: TransferenciasClientProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Form states
  const [origenId, setOrigenId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  
  // UI states
  const [currentStep, setCurrentStep] = useState<FormStep>('form')
  const [processingStatus, setProcessingStatus] = useState<string[]>([])
  const [latestTransfer, setLatestTransfer] = useState<Transfer | null>(null)
  
  // History filters
  const [historySearch, setHistorySearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'completada' | 'rechazada'>('todos')

  async function loadData() {
    setIsLoading(true)
    try {
      const realAccounts = await api.getAccounts()
      setAccounts(realAccounts)
      if (realAccounts.length > 0 && !origenId) {
        setOrigenId(realAccounts[0].id)
      }
      const realTransfers = await api.getTransfers()
      setTransfers(realTransfers)
    } catch (err) {
      console.error('Error cargando datos de transferencias:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeAccounts = accounts.filter((a) => a.estado === 'activa')
  const selectedOrigen = accounts.find((a) => a.id === origenId)
  
  // Stats
  const completedCount = transfers.filter((t) => t.estado === 'completada').length
  const rejectedCount = transfers.filter((t) => t.estado === 'rechazada').length
  const totalTransferred = transfers
    .filter((t) => t.estado === 'completada')
    .reduce((s, t) => s + t.monto, 0)

  // Contacts shortcut (other active accounts)
  const contacts = accounts.filter((a) => a.id !== origenId && a.estado === 'activa')

  // Presets for Amount
  const amountPresets = [50, 100, 200, 500, 1000]

  const handleSelectContact = (id: string) => {
    setDestinoId(id)
    toast.info(`Destinatario seleccionado: ${accounts.find(a => a.id === id)?.titular}`)
  }

  const handleAddPreset = (value: number) => {
    const currentVal = Number(monto) || 0
    setMonto(String(currentVal + value))
  }

  const handleClearAmount = () => {
    setMonto('')
  }

  const handleQuickDeposit = async (id: string, currentBalance: number) => {
    toast.promise(
      api.updateAccount(id, { saldo: currentBalance + 10000 }).then(async (updated) => {
        const updatedAccounts = await api.getAccounts().catch(() => accounts)
        setAccounts(updatedAccounts)
        return updated
      }),
      {
        loading: 'Depositando fondos en el backend AWS...',
        success: '¡Depósito exitoso! Se agregaron Bs. 10,000 a la cuenta.',
        error: 'Error al depositar fondos en el servidor'
      }
    )
  }

  const handleStartTransfer = async () => {
    if (!origenId || !destinoId || !monto || !concepto.trim()) {
      toast.error('Completa todos los campos del formulario')
      return
    }
    if (origenId === destinoId) {
      toast.error('La cuenta de origen y de destino no pueden ser la misma')
      return
    }
    const amount = Number(monto)
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a 0')
      return
    }
    if (selectedOrigen && selectedOrigen.saldo < amount) {
      toast.info('Procesando sobregiro', {
        description: `Enviando transferencia de ${formatCurrency(amount)} con saldo actual de ${formatCurrency(selectedOrigen.saldo)}. El microservicio evaluará la transacción.`
      })
    }

    // Enter processing step
    setCurrentStep('processing')
    setProcessingStatus([])

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    try {
      setProcessingStatus(['Iniciando firma digital y token de seguridad...'])
      await wait(500)
      
      setProcessingStatus((prev) => [...prev, 'Validando fondos y reglas de negocio...'])
      await wait(500)
      
      setProcessingStatus((prev) => [...prev, 'Enviando transacción a API Gateway backend...'])
      
      // Call real backend API
      const realTransfer = await api.createTransfer({
        fromAccountId: origenId,
        toAccountId: destinoId,
        amount: amount,
        concept: concepto.trim(),
      })

      const origen = accounts.find((a) => a.id === origenId)!
      const destino = accounts.find((a) => a.id === destinoId)!

      const newTransfer: Transfer = {
        ...realTransfer,
        cuentaOrigen: origen.numeroCuenta,
        cuentaDestino: destino.numeroCuenta,
        titularOrigen: origen.titular,
        titularDestino: destino.titular,
        concepto: concepto.trim() || 'Transferencia',
      }

      // Refresh accounts from backend
      const updatedAccounts = await api.getAccounts().catch(() => accounts)
      setAccounts(updatedAccounts)

      setTransfers((prev) => [newTransfer, ...prev])
      setLatestTransfer(newTransfer)
      setCurrentStep('receipt')
      
      if (newTransfer.estado === 'rechazada') {
        toast.error('Transferencia Rechazada por el Backend', {
          description: newTransfer.motivoRechazo || 'Saldo insuficiente para procesar la transacción.'
        })
      } else {
        toast.success('Transferencia completada con éxito', {
          description: `Se han transferido ${formatCurrency(amount)} a ${destino.titular}.`
        })

        // Heavy amount trigger warning
        if (amount >= MONTO_ALERTA_ELEVADO) {
          toast.warning('Alerta de Control de Seguridad', {
            description: `La transferencia supera el límite establecido (Bs. ${MONTO_ALERTA_ELEVADO}). Se ha generado una alerta automática.`,
            duration: 6000,
          })
        }
      }

    } catch (err: any) {
      console.error(err)
      toast.error('Ocurrió un error al procesar la transferencia en el backend')
      setCurrentStep('form')
    }
  }

  const handleResetForm = () => {
    setDestinoId('')
    setMonto('')
    setConcepto('')
    setLatestTransfer(null)
    setCurrentStep('form')
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  // Filtered transfers list
  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch = 
      t.titularDestino.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.titularOrigen.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.concepto.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.id.toLowerCase().includes(historySearch.toLowerCase())

    const matchesStatus = 
      statusFilter === 'todos' || t.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  // Visual card helper theme gradient based on type/id
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-teal-600/95 to-emerald-800/90 shadow-[0_8px_20px_rgba(20,184,166,0.15)]',
      'from-slate-800 to-slate-900 border border-slate-700/50 shadow-md',
      'from-cyan-900 to-teal-950 border border-cyan-800/40 shadow-md',
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transferencias"
        description="Envía fondos de forma instantánea entre cuentas de Banca Simplificada"
      />

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Transferido" 
          value={formatCurrency(totalTransferred)} 
          icon={ArrowLeftRight} 
          className="hover:shadow-md hover:border-primary/20 transition-all duration-300" 
        />
        <StatCard 
          title="Completadas" 
          value={String(completedCount)} 
          icon={CheckCircle2} 
          className="hover:shadow-md hover:border-emerald-500/20 transition-all duration-300" 
        />
        <StatCard 
          title="Rechazadas" 
          value={String(rejectedCount)} 
          icon={XCircle} 
          className="hover:shadow-md hover:border-red-500/20 transition-all duration-300" 
        />
        <StatCard 
          title="Límite de Alerta" 
          value={formatCurrency(MONTO_ALERTA_ELEVADO)} 
          icon={AlertTriangle} 
          description="Monitoreo de montos"
          className="hover:shadow-md hover:border-amber-500/20 transition-all duration-300" 
        />
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'form' && (
          <motion.div
            key="transfer-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-12"
          >
            {/* Left Block: Account selection & Destination setup */}
            <div className="lg:col-span-8 space-y-6">
              {/* Account Selection Card List */}
              <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        1. Cuenta de Origen
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Selecciona la cuenta desde la cual deseas transferir fondos
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20">
                      {activeAccounts.length} Activas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeAccounts.map((account) => {
                      const isSelected = origenId === account.id
                      return (
                        <button
                          key={account.id}
                          onClick={() => {
                            setOrigenId(account.id)
                            // If selected account is the destination account, reset destination
                            if (destinoId === account.id) {
                              setDestinoId('')
                            }
                          }}
                          className={cn(
                            "relative flex items-center justify-between p-4 rounded-xl text-left border transition-all duration-200 focus:outline-none w-full select-none",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(20,184,166,0.08)] ring-1 ring-primary"
                              : "border-border bg-card hover:bg-muted/50 text-card-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              <Cpu className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-foreground uppercase tracking-wide truncate max-w-[140px] sm:max-w-[110px] md:max-w-[200px]">
                                {account.titular}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {account.numeroCuenta} · <span className="uppercase">{account.tipo === 'ahorro' ? 'Ahorro' : 'Corr.'}</span>
                              </div>
                            </div>
                          </div>
                                             <div className="text-right space-y-1">
                            <div className="font-mono text-xs font-bold tabular-nums text-primary">
                              {formatCurrency(account.saldo)}
                            </div>
                            {isSelected ? (
                              <div className="flex flex-col items-end gap-1">
                                <Badge className="bg-primary hover:bg-primary text-[8px] px-1.5 py-0 uppercase tracking-widest font-bold border-none h-4">
                                  Origen
                                </Badge>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleQuickDeposit(account.id, account.saldo)
                                  }}
                                  className="text-[9px] text-emerald-500 hover:text-emerald-400 hover:underline font-bold"
                                >
                                  + Bs. 10,000
                                </button>
                              </div>
                            ) : null}
                          </div>        
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Destination Selection */}
              <Card className="border-border bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    2. Cuenta de Destino
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Selecciona un destinatario rápido de tu lista o busca otra cuenta activa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Quick Contacts List */}
                  {contacts.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Destinatarios Frecuentes
                      </Label>
                      <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none">
                        {contacts.map((contact) => {
                          const isDestSelected = destinoId === contact.id
                          const initials = contact.titular
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()

                          return (
                            <button
                              key={contact.id}
                              onClick={() => handleSelectContact(contact.id)}
                              className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0 group"
                            >
                              <div className={cn(
                                "relative h-12 w-12 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm border",
                                isDestSelected
                                  ? "bg-primary text-primary-foreground border-primary scale-110 ring-2 ring-primary/20"
                                  : "bg-muted hover:bg-accent hover:border-primary/30 text-foreground border-border group-hover:scale-105"
                              )}>
                                {initials}
                                {isDestSelected && (
                                  <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-background">
                                    <Check className="h-2 w-2" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-medium truncate w-16 text-center text-muted-foreground group-hover:text-foreground transition-colors">
                                {contact.titular.split(' ')[0]}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Manual selector dropdown */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Buscar cuenta de destino
                    </Label>
                    <Select value={destinoId} onValueChange={(v) => setDestinoId(v || '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el destinatario de la transferencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAccounts
                          .filter((a) => a.id !== origenId)
                          .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              <div className="flex items-center justify-between w-full gap-4 text-sm">
                                <span className="font-semibold">{a.titular}</span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {a.numeroCuenta}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Block: Amount setup, concept & actions */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="h-full border-border bg-card/60 backdrop-blur-sm flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    3. Detalles del Envío
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ingresa el monto a transferir y el concepto de la transacción
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 flex-1">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Monto (BOB)
                      </Label>
                      {monto && (
                        <button 
                          onClick={handleClearAmount}
                          className="text-[10px] text-destructive hover:underline font-semibold"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground font-mono">
                        Bs.
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="pl-12 font-mono text-2xl font-bold tracking-wide h-14 focus-visible:ring-primary"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                      />
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {amountPresets.map((val) => (
                        <Button
                          key={val}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-mono font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                          onClick={() => handleAddPreset(val)}
                        >
                          +{val}
                        </Button>
                      ))}
                    </div>

                    {/* Alert checks */}
                    {Number(monto) >= MONTO_ALERTA_ELEVADO && (
                      <div className="text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-lg flex items-start gap-1.5 animate-pulse mt-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                        <div>
                          <p className="font-semibold">Monto Elevado Detectado</p>
                          <p className="opacity-95">Esta operación superará el límite (Bs. {MONTO_ALERTA_ELEVADO}) y registrará una alerta de control.</p>
                        </div>
                      </div>
                    )}

                    {selectedOrigen && Number(monto) > selectedOrigen.saldo && (
                      <div className="text-[11px] bg-destructive/10 border border-destructive/20 text-destructive p-2.5 rounded-lg flex items-start gap-1.5 mt-2">
                        <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-destructive" />
                        <div>
                          <p className="font-semibold">Saldo Insuficiente</p>
                          <p className="opacity-95">Esta transacción excede los fondos disponibles en la cuenta de origen.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Concept Input */}
                  <div className="space-y-2">
                    <Label htmlFor="concept" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Concepto
                    </Label>
                    <Textarea
                      id="concept"
                      placeholder="Ej. Pago de alquiler, cena familiar..."
                      className="resize-none text-sm placeholder:text-muted-foreground/50 min-h-[80px] focus-visible:ring-primary"
                      value={concepto}
                      onChange={(e) => setConcepto(e.target.value)}
                      maxLength={150}
                    />
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-0.5">
                      <span>Máximo 150 caracteres</span>
                      <span className="font-mono">{concepto.length}/150</span>
                    </div>
                  </div>
                </CardContent>

                {/* Transfer Actions */}
                <div className="p-6 pt-0 border-t border-border bg-muted/20">
                  <div className="space-y-3 pt-4">
                    {/* Summary row */}
                    {selectedOrigen && destinoId && monto && (
                      <div className="bg-background/80 p-3 rounded-lg border border-border/80 text-xs space-y-1.5 font-sans">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Origen:</span>
                          <span className="font-semibold truncate max-w-[150px]">{selectedOrigen.titular}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Destinatario:</span>
                          <span className="font-semibold truncate max-w-[150px]">{accounts.find(a => a.id === destinoId)?.titular}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-border/50 font-bold text-sm">
                          <span className="text-foreground">Total a enviar:</span>
                          <span className="text-primary font-mono">{formatCurrency(Number(monto))}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleStartTransfer}
                      disabled={!origenId || !destinoId || !monto || !concepto.trim()}
                      className="w-full h-11 text-sm font-semibold shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.35)] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Enviar Transferencia
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing-view"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center py-12"
          >
            <Card className="w-full max-w-md border-border bg-card/70 backdrop-blur-md shadow-2xl p-6 text-center space-y-6">
              <div className="flex flex-col items-center justify-center space-y-3 pt-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <ArrowLeftRight className="absolute h-6 w-6 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Procesando Transferencia</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Por favor no cierres la ventana, estamos conectando con los servicios bancarios de seguridad.
                </p>
              </div>

              {/* Interactive Status Log */}
              <div className="bg-background/80 rounded-xl p-4 border border-border text-left space-y-2.5 font-mono text-xs text-muted-foreground max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {processingStatus.map((status, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-primary"
                    >
                      <span className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
                      <span>{status}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Digital Receipt State */}
        {currentStep === 'receipt' && latestTransfer && (
          <motion.div
            key="receipt-view"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="flex justify-center items-center py-6"
          >
            <div className="w-full max-w-md space-y-6">
              {/* Receipt Ticket Body */}
              <div className="relative bg-card border border-border rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none">
                
                {/* Visual Top Bar */}
                <div className={`h-2 bg-gradient-to-r ${latestTransfer.estado === 'rechazada' ? 'from-red-500 to-rose-600' : 'from-teal-500 to-emerald-500'}`} />
                
                {/* Decorative cut circles on the side */}
                <div className="absolute left-0 top-[280px] -translate-x-1/2 h-6 w-6 bg-background rounded-full border-r border-border print:hidden" />
                <div className="absolute right-0 top-[280px] translate-x-1/2 h-6 w-6 bg-background rounded-full border-l border-border print:hidden" />

                <div className="p-8 space-y-6">
                  {/* Status header */}
                  <div className="flex flex-col items-center text-center space-y-2.5">
                    {latestTransfer.estado === 'rechazada' ? (
                      <>
                        <div className="h-14 w-14 rounded-full bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center shadow-inner">
                          <XCircle className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">Transferencia Fallida</h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            Comprobante de Rechazo · {latestTransfer.id}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold tracking-tight text-foreground">Transferencia Exitosa</h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            Comprobante Digital · {latestTransfer.id}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Main Transfer Amount */}
                  <div className="bg-muted/40 dark:bg-muted/10 rounded-2xl p-4 text-center border border-border/50">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-0.5">
                      {latestTransfer.estado === 'rechazada' ? 'Monto Solicitado' : 'Monto Transferido'}
                    </span>
                    <span className="font-mono text-3xl font-bold tracking-tight text-primary tabular-nums">
                      {formatCurrency(latestTransfer.monto)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3 text-xs pt-2">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Fecha y Hora</span>
                      <span className="font-semibold text-foreground">{formatDate(latestTransfer.fechaCreacion)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Cuenta de Origen</span>
                      <span className="font-mono font-semibold text-foreground">{latestTransfer.cuentaOrigen}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Cuenta de Destino</span>
                      <span className="font-mono font-semibold text-foreground">{latestTransfer.cuentaDestino}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Beneficiario</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">{latestTransfer.titularDestino}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Concepto</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px] italic">{latestTransfer.concepto}</span>
                    </div>
                    {latestTransfer.estado === 'rechazada' && (
                      <div className="flex justify-between py-1.5 border-b border-border/40 text-red-500 font-medium">
                        <span>Motivo de Fallo</span>
                        <span className="truncate max-w-[200px] text-right text-[11px] font-bold">{latestTransfer.motivoRechazo || 'Saldo insuficiente'}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Estado</span>
                      <Badge 
                        variant={latestTransfer.estado === 'rechazada' ? 'destructive' : 'default'} 
                        className={`border-none font-medium px-2 py-0 text-[10px] h-5 ${
                          latestTransfer.estado === 'rechazada' 
                            ? 'bg-red-500 hover:bg-red-500 text-white' 
                            : 'bg-emerald-500 hover:bg-emerald-500'
                        }`}
                      >
                        {latestTransfer.estado === 'rechazada' ? 'Fallida' : 'Procesada'}
                      </Badge>
                    </div>
                  </div>

                  {/* Dashed Separator */}
                  <div className="border-t-2 border-dashed border-border/80 my-4" />

                  {/* Barcode & Security info */}
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1">
                      {/* CSS Barcode */}
                      <div className="flex justify-center items-center gap-[2px] h-10 w-full opacity-60">
                        <div className="w-[2px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[3px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[4px] h-full bg-foreground" />
                        <div className="w-[2px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[3px] h-full bg-foreground" />
                        <div className="w-[2px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[4px] h-full bg-foreground" />
                        <div className="w-[2px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[3px] h-full bg-foreground" />
                        <div className="w-[1px] h-full bg-foreground" />
                        <div className="w-[4px] h-full bg-foreground" />
                      </div>
                      <p className="text-center font-mono text-[9px] tracking-wider text-muted-foreground">
                        HASH: {latestTransfer.id}-{generateId()}
                      </p>
                    </div>

                    <div className="text-[10px] text-center text-muted-foreground bg-muted/20 p-2.5 rounded-lg leading-relaxed border border-border/40">
                      Este documento digital sirve como comprobante de transacciones de Banca Simplificada. Cuentas auditadas mediante protocolos de seguridad financiera.
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="flex gap-3 justify-center print:hidden">
                <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button className="flex-1 gap-2 font-semibold" onClick={handleResetForm}>
                  Nueva Transferencia
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History log block */}
      <Card className="backdrop-blur-md shadow-lg border-border bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Historial de Transferencias
              </CardTitle>
              <CardDescription className="text-xs">
                Consulta y filtra las transferencias enviadas o recibidas en la plataforma
              </CardDescription>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/75" />
                <Input
                  placeholder="Buscar destinatario, concepto..."
                  className="pl-9 text-xs h-9 placeholder:text-muted-foreground/60"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>
              
              {/* State Filter Buttons */}
              <div className="flex rounded-lg border border-border p-0.5 bg-muted/20 h-9">
                <button
                  onClick={() => setStatusFilter('todos')}
                  className={cn(
                    "px-3 text-xs font-semibold rounded-md transition-colors",
                    statusFilter === 'todos'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('completada')}
                  className={cn(
                    "px-3 text-xs font-semibold rounded-md transition-colors",
                    statusFilter === 'completada'
                      ? "bg-background text-foreground shadow-sm animate-fade-in"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Exitosas
                </button>
                <button
                  onClick={() => setStatusFilter('rechazada')}
                  className={cn(
                    "px-3 text-xs font-semibold rounded-md transition-colors",
                    statusFilter === 'rechazada'
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Rechazadas
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">ID</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuentas Involucradas</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concepto</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Estado</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((tx) => {
                  const stateConfig = TRANSFER_STATES[tx.estado]
                  const isCompleted = tx.estado === 'completada'
                  
                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/50 border-border transition-colors group">
                      <TableCell className="font-mono text-xs text-muted-foreground font-semibold">{tx.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-bold text-foreground leading-none">{tx.titularOrigen}</p>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-primary" />
                            <span>{tx.titularDestino}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate italic">
                        {tx.concepto}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-medium">
                        {formatDate(tx.fechaCreacion)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stateConfig.variant} className="relative pl-5 font-semibold border-none py-0.5 text-[10px] uppercase tracking-wide">
                          <span className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}`}>
                            {isCompleted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>}
                          </span>
                          {stateConfig.label}
                        </Badge>
                        {tx.motivoRechazo && (
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 max-w-[150px] font-mono leading-none">
                            {tx.motivoRechazo}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums font-bold text-sm text-primary group-hover:scale-[1.01] transition-transform">
                        {formatCurrency(tx.monto)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredTransfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2 py-6">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                        <p>No se encontraron registros de transferencias.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
