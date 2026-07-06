'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Bell, BellRing, AlertTriangle, XCircle, CheckCircle2,
  RefreshCw, CheckCheck, Loader2, Info, Eye, EyeOff
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateAlertsFromTransfers, getAlertStats, markAlertAsRead, markAllAlertsAsRead, getReadAlertIds } from '@/lib/alerts'
import type { Alert } from '@/types'
import { toast } from 'sonner'

type FilterType = 'todas' | 'monto_elevado' | 'transferencia_completada' | 'transferencia_rechazada'

export function AlertasClient() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas')

  async function loadAlertsData() {
    setIsLoading(true)
    try {
      const transfers = await api.getTransfers().catch(() => [])
      const generated = generateAlertsFromTransfers(transfers)
      setAlerts(generated)
    } catch (err) {
      console.error('Error al cargar alertas:', err)
      toast.error('Error al sincronizar con el microservicio de alertas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Alertas & Auditoría | Banca Simplificada'
    loadAlertsData()
  }, [])

  const stats = getAlertStats(alerts)

  function handleMarkAllAsRead() {
    const unreadIds = alerts.filter((a) => !a.leida).map((a) => a.id)
    if (unreadIds.length > 0) {
      markAllAlertsAsRead(unreadIds)
      setAlerts((prev) => prev.map((a) => ({ ...a, leida: true })))
      toast.success('Todas las alertas marcadas como leídas')
    }
  }

  function handleToggleRead(id: string, isRead: boolean) {
    if (!isRead) {
      markAlertAsRead(id)
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, leida: true } : a))
      )
      toast.success('Alerta marcada como leída')
    }
  }

  const filteredAlerts = alerts.filter((alt) => {
    if (activeFilter === 'todas') return true
    return alt.tipo === activeFilter
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas & Auditoría"
        description="Centro de control y monitoreo de transacciones mediante el microservicio NATS en AWS"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlertsData}
            disabled={isLoading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refrescar
          </Button>
          {stats.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-9 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas leídas
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alertas"
          value={isLoading ? '...' : String(stats.total)}
          icon={Bell}
          description="Alertas generadas por auditoría"
          className="hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.03)]"
        />
        <StatCard
          title="Alertas Sin Leer"
          value={isLoading ? '...' : String(stats.unread)}
          icon={BellRing}
          description="Acciones pendientes de revisión"
          className={`transition-all duration-300 ${stats.unread > 0 ? 'border-primary/40 shadow-[0_0_15px_rgba(20,184,166,0.05)]' : 'hover:border-primary/20'}`}
        />
        <StatCard
          title="Montos Elevados"
          value={isLoading ? '...' : String(stats.highAmount)}
          icon={AlertTriangle}
          description="Transacciones >= Bs. 5,000"
          className="hover:border-amber-500/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.03)]"
        />
        <StatCard
          title="Transferencias Rechazadas"
          value={isLoading ? '...' : String(stats.rejected)}
          icon={XCircle}
          description="Fallos capturados por el worker"
          className="hover:border-red-500/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.03)]"
        />
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground">Información del Microservicio NATS</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Las alertas se generan automáticamente a partir de eventos de transacciones procesados por el microservicio backend de <strong>Alertas</strong> (NATS Event Worker). El worker audita transferencias completadas, fallidas y montos de alto volumen (superiores a Bs. 5,000). Los logs completos se registran en CloudWatch de AWS.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Content Card */}
      <Card className="backdrop-blur-md shadow-lg border-border bg-card/60">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight">Registro de Alertas</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Historial de auditoría para transferencias y alertas de seguridad
            </CardDescription>
          </div>

          {/* Simple Button Group for Filtering */}
          <div className="flex flex-wrap gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 w-fit">
            {(['todas', 'monto_elevado', 'transferencia_completada', 'transferencia_rechazada'] as const).map((filter) => {
              const label = {
                todas: 'Todas',
                monto_elevado: 'Monto Elevado',
                transferencia_completada: 'Completadas',
                transferencia_rechazada: 'Rechazadas',
              }[filter]

              const isActive = activeFilter === filter

              return (
                <Button
                  key={filter}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className={`h-7 text-xs px-3 rounded-md transition-all ${isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Sincronizando alertas con NATS y AWS...</p>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="divide-y divide-border/60">
              {filteredAlerts.map((alt) => {
                const isHighAmount = alt.tipo === 'monto_elevado'
                const isCompleted = alt.tipo === 'transferencia_completada'
                const isRejected = alt.tipo === 'transferencia_rechazada'

                const badgeVariant = isHighAmount ? 'destructive' : isCompleted ? 'default' : 'destructive'
                const badgeLabel = isHighAmount ? 'Monto Elevado' : isCompleted ? 'Completada' : 'Rechazada'

                return (
                  <div
                    key={alt.id}
                    onClick={() => handleToggleRead(alt.id, alt.leida)}
                    className={`p-4 transition-all duration-200 flex items-start gap-4 hover:bg-muted/30 cursor-pointer group relative ${
                      !alt.leida ? 'bg-primary/5 dark:bg-primary/10' : 'opacity-80'
                    }`}
                  >
                    {/* Left status bar indicators */}
                    {!alt.leida && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                    )}

                    <div className="mt-1 shrink-0">
                      {isHighAmount ? (
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      ) : isRejected ? (
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:scale-105 transition-transform">
                          <XCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={badgeVariant}
                            className={`border-none text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                              isHighAmount ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25' :
                              isCompleted ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25' :
                              'bg-red-500/15 text-red-500 hover:bg-red-500/25'
                            }`}
                          >
                            {badgeLabel}
                          </Badge>
                          {!alt.leida && (
                            <span className="flex h-2 w-2 rounded-full bg-primary relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDate(alt.fecha)}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-foreground leading-relaxed pr-8">
                        {alt.mensaje}
                      </p>

                      {alt.monto && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <span>Monto auditado:</span>
                          <span className="font-mono text-foreground font-bold">{formatCurrency(alt.monto)}</span>
                        </div>
                      )}
                    </div>

                    {/* Toggle read/unread button */}
                    <div className="self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title={alt.leida ? 'Marcar como no leída' : 'Marcar como leída'}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (alt.leida) {
                            // no leída (remover de localStorage)
                            const readSet = getReadAlertIds()
                            readSet.delete(alt.id)
                            localStorage.setItem('banca-alerts-read', JSON.stringify(Array.from(readSet)))
                            setAlerts((prev) =>
                              prev.map((a) => (a.id === alt.id ? { ...a, leida: false } : a))
                            )
                            toast.info('Alerta marcada como no leída')
                          } else {
                            handleToggleRead(alt.id, alt.leida)
                          }
                        }}
                      >
                        {alt.leida ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="border-t border-border">
              <EmptyState
                icon={Bell}
                title={activeFilter === 'todas' ? 'No hay alertas registradas' : 'No se encontraron alertas'}
                description={
                  activeFilter === 'todas'
                    ? 'Las alertas se generan automáticamente cuando el microservicio NATS procesa transferencias completadas, fallidas o montos superiores a Bs. 5,000.'
                    : `No hay registros en la categoría de "${
                        activeFilter === 'monto_elevado' ? 'Monto Elevado' : activeFilter === 'transferencia_completada' ? 'Completadas' : 'Rechazadas'
                      }".`
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
