'use client'

import { useState, useEffect } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell, Moon, Sun, User, LogOut, ShieldAlert,
  CheckCircle2, AlertTriangle, Info, CheckCheck, Trash2, XCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { generateAlertsFromTransfers, getReadAlertIds, markAlertAsRead, markAllAlertsAsRead } from '@/lib/alerts'
import { formatDate } from '@/lib/utils'
import type { Alert } from '@/types'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadAlerts() {
    setIsLoading(true)
    try {
      const transfers = await api.getTransfers().catch(() => [])
      const generated = generateAlertsFromTransfers(transfers)
      setAlerts(generated)
    } catch (e) {
      console.error('Error al sincronizar notificaciones:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()

    // Configurar polling opcional o escuchar cambios locales
    const interval = setInterval(loadAlerts, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = alerts.filter((a) => !a.leida).length

  function handleMarkAllAsRead() {
    const unreadIds = alerts.filter((a) => !a.leida).map((a) => a.id)
    if (unreadIds.length > 0) {
      markAllAlertsAsRead(unreadIds)
      setAlerts((prev) => prev.map((a) => ({ ...a, leida: true })))
      toast.success('Todas las notificaciones marcadas como leídas')
    }
  }

  function handleToggleAlertRead(id: string, isRead: boolean) {
    if (!isRead) {
      markAlertAsRead(id)
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, leida: true } : a))
      )
    }
  }

  function handleClearAlerts() {
    const allIds = alerts.map((a) => a.id)
    markAllAlertsAsRead(allIds)
    setAlerts((prev) => prev.map((a) => ({ ...a, leida: true })))
    toast.info('Notificaciones marcadas como leídas')
  }

  // Mostrar solo las 5 más recientes
  const recentAlerts = alerts.slice(0, 5)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />

      <div className="flex-1" />

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Cambiar tema</span>
      </Button>

      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="icon" className="h-8 w-8 relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center font-bold animate-pulse"
              >
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notificaciones</span>
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 border-border bg-card/95 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-bold text-xs tracking-tight">Centro de Notificaciones</span>
              {unreadCount > 0 && (
                <Badge className="bg-primary hover:bg-primary text-[9px] px-1.5 py-0">
                  {unreadCount} nuevas
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar leídas
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                <p>Sincronizando con AWS...</p>
              </div>
            ) : recentAlerts.length > 0 ? (
              recentAlerts.map((alt) => {
                const isHighAmount = alt.tipo === 'monto_elevado'
                const isRejected = alt.tipo === 'transferencia_rechazada'

                return (
                  <div
                    key={alt.id}
                    onClick={() => handleToggleAlertRead(alt.id, alt.leida)}
                    className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-muted/50 ${
                      !alt.leida ? 'bg-primary/5 dark:bg-primary/10' : 'opacity-80'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isHighAmount ? (
                        <div className="p-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      ) : isRejected ? (
                        <div className="p-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${!alt.leida ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {isHighAmount ? 'Alerta de Control' : isRejected ? 'Transferencia Fallida' : 'Transferencia Exitosa'}
                        </p>
                        <span className="text-[9px] font-mono text-muted-foreground">{formatDate(alt.fecha)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {alt.mensaje}
                      </p>
                    </div>

                    {!alt.leida && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <Info className="h-6 w-6 mx-auto opacity-40 mb-1" />
                <p>No tienes notificaciones pendientes.</p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border bg-muted/20 flex justify-between items-center px-3.5">
            {alerts.length > 0 ? (
              <Link href="/alertas" className="text-[10px] text-primary hover:underline font-semibold flex items-center">
                Ver todas las alertas ({alerts.length})
              </Link>
            ) : (
              <span className="text-[10px] text-muted-foreground">Monitoreo NATS</span>
            )}
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAlerts}
                className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpiar todo
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">JP</AvatarFallback>
            </Avatar>
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Juan Pérez</p>
              <p className="text-xs text-muted-foreground">juan@email.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={
            <Link href="/perfil">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          } />
          <DropdownMenuSeparator />
          <DropdownMenuItem render={
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Link>
          } />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
