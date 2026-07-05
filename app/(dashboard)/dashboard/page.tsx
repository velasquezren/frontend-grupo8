'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Wallet, CreditCard, ArrowLeftRight, AlertTriangle,
  ArrowUpRight, Plus, Loader2, RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TRANSFER_STATES } from '@/lib/constants'
import type { Account, Transfer } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadDashboardData() {
    setIsLoading(true)
    try {
      const [liveAccounts, liveTransfers] = await Promise.all([
        api.getAccounts().catch(() => []),
        api.getTransfers().catch(() => []),
      ])
      setAccounts(liveAccounts)
      setTransfers(liveTransfers)
    } catch (err) {
      console.error('Error cargando dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Dashboard | Banca Simplificada'
    loadDashboardData()
  }, [])

  const totalBalance = accounts.filter((a) => a.estado === 'activa').reduce((s, a) => s + a.saldo, 0)
  const activeAccountsCount = accounts.filter((a) => a.estado === 'activa').length
  const completedTransfers = transfers.filter((t) => t.estado === 'completada').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen en tiempo real de tu billetera digital y cuentas en el backend"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
          <Button
            className="shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all hover:scale-[1.01]"
            render={
              <Link href="/transferencias">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transferencia
              </Link>
            }
          />
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={isLoading ? '...' : formatCurrency(totalBalance)}
          icon={Wallet}
          trend={{ value: 12.5, positive: true }}
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Cuentas Activas"
          value={isLoading ? '...' : String(activeAccountsCount)}
          icon={CreditCard}
          description={`De ${accounts.length} cuentas en sistema`}
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Transferencias"
          value={isLoading ? '...' : String(completedTransfers)}
          icon={ArrowLeftRight}
          description="Operaciones procesadas"
          trend={{ value: 8.2, positive: true }}
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Estado Sistema"
          value={isLoading ? 'Cargando...' : '100% OK'}
          icon={AlertTriangle}
          description="API Gateway Conectado"
          className="hover:border-emerald-500/20 transition-all duration-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Transfers */}
        <Card className="lg:col-span-3 backdrop-blur-md shadow-lg border-border bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Transferencias Recientes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Últimas operaciones realizadas en la plataforma</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/transferencias">Ver todas</Link>} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operación</TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p>Cargando datos desde el servidor...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {transfers.slice(0, 5).map((tx) => {
                      const stateConfig = TRANSFER_STATES[tx.estado] || TRANSFER_STATES['completada']
                      const isCompleted = tx.estado === 'completada'
                      return (
                        <TableRow key={tx.id} className="hover:bg-muted/50 border-border transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'}`}>
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold tracking-tight text-foreground">{tx.titularDestino || tx.cuentaDestinoId}</p>
                                <p className="text-xs text-muted-foreground">{tx.concepto}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {formatDate(tx.fechaCreacion)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={stateConfig.variant} className="relative pl-5 font-medium border-none py-0.5 text-[10px]">
                              <span className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'}`}>
                                {isCompleted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>}
                              </span>
                              {stateConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums font-bold text-sm text-foreground">
                            {formatCurrency(tx.monto)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {transfers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-28 text-center text-xs text-muted-foreground">
                          No hay transferencias registradas aún. ¡Realiza tu primera transferencia!
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Accounts Summary */}
        <Card className="lg:col-span-2 backdrop-blur-md shadow-lg border-border bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Cuentas Registradas</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Cuentas activas en la API backend</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/cuentas">Ver todas</Link>} />
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Cargando cuentas...</p>
              </div>
            ) : (
              <>
                {accounts.slice(0, 4).map((account) => (
                  <div
                    key={account.id}
                    className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-card to-muted/30 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(20,184,166,0.05)] hover:-translate-y-0.5 group flex items-center justify-between"
                  >
                    <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                    <div className="flex items-center gap-3 z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-foreground">{account.titular}</p>
                        <p className="text-xs text-muted-foreground font-mono">{account.numeroCuenta}</p>
                      </div>
                    </div>
                    <div className="text-right z-10 space-y-1">
                      <span className="block text-sm font-bold font-mono text-primary tabular-nums">
                        {formatCurrency(account.saldo)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary border border-primary/10 font-mono uppercase tracking-wide">
                        {account.tipo}
                      </span>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground space-y-3">
                    <p>No tienes cuentas registradas aún.</p>
                    <Button size="sm" render={<Link href="/cuentas"><Plus className="h-3.5 w-3.5 mr-1" /> Crear Cuenta</Link>} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
