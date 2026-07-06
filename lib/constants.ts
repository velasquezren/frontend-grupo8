import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Clock,
  Bell,
  User,
} from 'lucide-react'

export const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Cuentas', href: '/cuentas', icon: CreditCard },
  { title: 'Transferencias', href: '/transferencias', icon: ArrowLeftRight },
  { title: 'Movimientos', href: '/movimientos', icon: Clock },
  { title: 'Alertas', href: '/alertas', icon: Bell },
  { title: 'Perfil', href: '/perfil', icon: User },
] as const

export const MONTO_ALERTA_ELEVADO = 5000

export const ACCOUNT_TYPES = {
  ahorro: 'Ahorro',
  corriente: 'Corriente',
} as const

export const TRANSFER_STATES = {
  completada: { label: 'Completada', variant: 'default' as const },
  pendiente: { label: 'Pendiente', variant: 'secondary' as const },
  rechazada: { label: 'Rechazada', variant: 'destructive' as const },
  procesando: { label: 'Procesando', variant: 'outline' as const },
} as const

export const ACCOUNT_STATES = {
  activa: { label: 'Activa', variant: 'default' as const },
  inactiva: { label: 'Inactiva', variant: 'secondary' as const },
  bloqueada: { label: 'Bloqueada', variant: 'destructive' as const },
} as const
