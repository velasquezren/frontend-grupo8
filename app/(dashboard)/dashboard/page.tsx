import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Wallet, CreditCard, ArrowLeftRight, AlertTriangle,
  ArrowUpRight, Plus,
} from 'lucide-react'
import {
  getTotalBalance, getActiveAccountsCount, getCompletedTransfersCount,
  getUnreadAlertsCount, getRecentTransfers, getAccounts,
} from '@/lib/data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TRANSFER_STATES } from '@/lib/constants'
import Link from 'next/link'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  const totalBalance = getTotalBalance()
  const activeAccounts = getActiveAccountsCount()
  const completedTransfers = getCompletedTransfersCount()
  const unreadAlerts = getUnreadAlertsCount()
  const recentTransfers = getRecentTransfers(5)
  const accounts = getAccounts().filter((a) => a.estado === 'activa').slice(0, 4)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen de tu billetera digital"
      >
        <Button
          className="shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all hover:scale-[1.01]"
          render={
            <Link href="/transferencias">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Transferencia
            </Link>
          }
        />
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          trend={{ value: 12.5, positive: true }}
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Cuentas Activas"
          value={String(activeAccounts)}
          icon={CreditCard}
          description="De 5 cuentas registradas"
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Transferencias"
          value={String(completedTransfers)}
          icon={ArrowLeftRight}
          description="Completadas este mes"
          trend={{ value: 8.2, positive: true }}
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Alertas"
          value={String(unreadAlerts)}
          icon={AlertTriangle}
          description="Sin leer"
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Transfers */}
        <Card className="lg:col-span-3 backdrop-blur-md shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Transferencias Recientes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Últimas operaciones realizadas</CardDescription>
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
                {recentTransfers.map((tx) => {
                  const stateConfig = TRANSFER_STATES[tx.estado]
                  const isCompleted = tx.estado === 'completada'
                  return (
                    <TableRow key={tx.id} className="hover:bg-muted/50 border-border transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight text-foreground">{tx.titularDestino}</p>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Accounts Summary */}
        <Card className="lg:col-span-2 backdrop-blur-md shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Mis Cuentas</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Cuentas activas en la billetera</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/cuentas">Ver todas</Link>} />
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
