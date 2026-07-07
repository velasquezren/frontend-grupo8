'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ArrowDownLeft, ArrowUpRight, Clock, Loader2, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Account, Movement } from '@/types'

export default function MovimientosPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  async function loadData() {
    setIsLoading(true)
    try {
      const liveAccounts = await api.getAccounts()
      setAccounts(liveAccounts)

      // Derive movements from live accounts
      const derivedMovements: Movement[] = []
      liveAccounts.forEach((acc) => {
        derivedMovements.push({
          id: `MOV-INIT-${acc.id.slice(0, 8)}`,
          cuentaId: acc.id,
          numeroCuenta: acc.numeroCuenta,
          tipo: 'credito',
          monto: acc.saldo,
          moneda: 'BOB',
          saldoAnterior: 0,
          saldoNuevo: acc.saldo,
          descripcion: `Apertura de cuenta / Depósito inicial - ${acc.titular}`,
          referenciaTransferId: `INIT-${acc.id.slice(0, 6)}`,
          fecha: acc.creadaEn || new Date().toISOString(),
        })
      })

      setMovements(derivedMovements)
    } catch (err) {
      console.error('Error cargando movimientos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Movimientos | Banca Simplificada'
    loadData()
  }, [])

  const filteredMovements = movements.filter((m) => {
    if (filterAccount !== 'all' && m.cuentaId !== filterAccount) return false
    if (filterType !== 'all' && m.tipo !== filterType) return false
    if (searchQuery && !m.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalCreditos = movements.filter(m => m.tipo === 'credito').reduce((sum, m) => sum + m.monto, 0)
  const totalDebitos = movements.filter(m => m.tipo === 'debito').reduce((sum, m) => sum + m.monto, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        description="Historial en tiempo real de abonos, débitos y aperturas de cuentas en la plataforma"
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Movimientos"
          value={String(movements.length)}
          icon={Activity}
          description="Transacciones registradas"
          className="hover:border-primary/20 transition-all duration-300"
        />
        <StatCard
          title="Total Créditos / Abonos"
          value={formatCurrency(totalCreditos)}
          icon={ArrowDownLeft}
          className="hover:border-emerald-500/20 transition-all duration-300"
        />
        <StatCard
          title="Total Débitos"
          value={formatCurrency(totalDebitos)}
          icon={ArrowUpRight}
          className="hover:border-red-500/20 transition-all duration-300"
        />
      </div>

      <Card className="backdrop-blur-md shadow-lg border-border bg-card/60">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Historial de Movimientos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Consulte débitos y abonos filtrando por cuenta o tipo de operación
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descripción..."
                  className="pl-9 placeholder:text-muted-foreground/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterAccount} onValueChange={(v) => setFilterAccount(v || 'all')}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Filtrar por cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.titular} ({a.numeroCuenta})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(v) => setFilterType(v || 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="credito">Créditos (+)</SelectItem>
                  <SelectItem value="debito">Débitos (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descripción</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuenta</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</TableHead>
                <TableHead className="text-right hidden lg:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Anterior</TableHead>
                <TableHead className="text-right hidden lg:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Nuevo</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>Cargando movimientos desde el servidor...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredMovements.map((mov) => {
                    const isCredito = mov.tipo === 'credito'
                    return (
                      <TableRow key={mov.id} className="hover:bg-muted/50 border-border transition-colors">
                        <TableCell>
                          <div className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full border',
                            isCredito ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                          )}>
                            {isCredito ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-bold text-foreground">{mov.descripcion}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">Ref: {mov.referenciaTransferId || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                          {mov.numeroCuenta}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {formatDate(mov.fecha)}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell font-mono tabular-nums text-xs text-muted-foreground">
                          {formatCurrency(mov.saldoAnterior)}
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell font-mono tabular-nums text-xs text-muted-foreground">
                          {formatCurrency(mov.saldoNuevo)}
                        </TableCell>
                        <TableCell className={cn(
                          'text-right font-mono tabular-nums font-bold text-sm',
                          isCredito ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {isCredito ? '+' : '-'}{formatCurrency(mov.monto)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredMovements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-muted-foreground/30" />
                          <p>No se encontraron movimientos. {accounts.length === 0 ? 'Crea cuentas en el sistema para empezar a registrar movimientos.' : 'Prueba cambiando los filtros.'}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
