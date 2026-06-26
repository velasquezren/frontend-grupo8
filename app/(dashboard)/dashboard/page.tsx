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
        <Button render={
          <Link href="/transferencias">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transferencia
          </Link>
        } />
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title="Cuentas Activas"
          value={String(activeAccounts)}
          icon={CreditCard}
          description="De 5 cuentas registradas"
        />
        <StatCard
          title="Transferencias"
          value={String(completedTransfers)}
          icon={ArrowLeftRight}
          description="Completadas este mes"
          trend={{ value: 8.2, positive: true }}
        />
        <StatCard
          title="Alertas"
          value={String(unreadAlerts)}
          icon={AlertTriangle}
          description="Sin leer"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Transfers */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Transferencias Recientes</CardTitle>
              <CardDescription>Últimas operaciones realizadas</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/transferencias">Ver todas</Link>} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operación</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransfers.map((tx) => {
                  const stateConfig = TRANSFER_STATES[tx.estado]
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.titularDestino}</p>
                            <p className="text-xs text-muted-foreground">{tx.concepto}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDate(tx.fechaCreacion)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stateConfig.variant}>{stateConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums font-medium">
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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Mis Cuentas</CardTitle>
              <CardDescription>Cuentas activas</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/cuentas">Ver todas</Link>} />
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.titular}</p>
                    <p className="text-xs text-muted-foreground font-mono">{account.numeroCuenta}</p>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono tabular-nums">
                  {formatCurrency(account.saldo)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
