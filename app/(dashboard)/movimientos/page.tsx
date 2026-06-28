'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react'
import { MOCK_MOVEMENTS, MOCK_ACCOUNTS } from '@/lib/data'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export default function MovimientosPage() {
  useEffect(() => {
    document.title = 'Movimientos | Banca Simplificada'
  }, [])
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const movements = MOCK_MOVEMENTS.filter((m) => {
    if (filterAccount !== 'all' && m.cuentaId !== filterAccount) return false
    if (filterType !== 'all' && m.tipo !== filterType) return false
    if (searchQuery && !m.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        description="Historial completo de movimientos de todas las cuentas"
      />

      <Card className="backdrop-blur-md shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Historial de Movimientos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Créditos y débitos de cada cuenta</CardDescription>
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
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Filtrar por cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {MOCK_ACCOUNTS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.titular}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(v) => setFilterType(v || 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="credito">Créditos</SelectItem>
                  <SelectItem value="debito">Débitos</SelectItem>
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
              {movements.map((mov) => {
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
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-8 w-8 text-muted-foreground/30" />
                      <p>No se encontraron movimientos con los filtros aplicados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
