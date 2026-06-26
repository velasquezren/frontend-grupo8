# 🏛️ Layouts — Patrones de Layout para Banca

> Layouts que garantizan sinergia visual entre TODAS las páginas.

## Root Layout — `app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Banca Simplificada', template: '%s | Banca Simplificada' },
  description: 'Tu banca digital, simplificada.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
```

## Auth Layout — `app/(auth)/layout.tsx`

Páginas de login/register sin sidebar. Centrado con branding.

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-md space-y-6 px-4">
        {/* Logo/Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Banca Simplificada</h1>
          <p className="text-sm text-muted-foreground">Tu banca digital</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

## Dashboard Layout — `app/(dashboard)/layout.tsx`

Layout principal con sidebar, header y contenido.

```tsx
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
```

## Sidebar Component — `components/layout/sidebar.tsx`

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight,
  Clock, User, Settings, LogOut,
} from 'lucide-react'
import {
  Sidebar as ShadcnSidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Cuentas', href: '/cuentas', icon: CreditCard },
  { title: 'Transferencias', href: '/transferencias', icon: ArrowLeftRight },
  { title: 'Movimientos', href: '/movimientos', icon: Clock },
  { title: 'Perfil', href: '/perfil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <ShadcnSidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold">Banca</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton isActive={pathname === item.href || pathname.startsWith(item.href + '/')} render={
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              } />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={
              <Link href="/">
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </Link>
            } />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
```

## Header Component — `components/layout/header.tsx`

```tsx
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">JD</AvatarFallback>
      </Avatar>
    </header>
  )
}
```

## Patrón de Página Estándar

Cada página del dashboard DEBE seguir este patrón para sinergia visual:

```tsx
// app/(dashboard)/cuentas/page.tsx
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = { title: 'Cuentas' }

export default function CuentasPage() {
  return (
    <div className="space-y-6">
      {/* 1. Header con título + acciones */}
      <PageHeader title="Cuentas" description="Gestiona tus cuentas bancarias">
        <Button><Plus className="h-4 w-4 mr-2" />Nueva cuenta</Button>
      </PageHeader>

      {/* 2. Stats (opcional) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* StatCards */}
      </div>

      {/* 3. Contenido principal */}
      <Card>
        {/* Tabla, lista, o contenido */}
      </Card>
    </div>
  )
}
```

## Reglas de Layout

1. **Root layout** = fuentes + providers + toaster. NADA más.
2. **Route groups** `()` para separar auth vs dashboard layouts.
3. **Sidebar** persiste entre navegaciones — `'use client'` con `usePathname`.
4. **Cada página** sigue: PageHeader → Stats → Content.
5. **Padding responsivo**: `p-4 md:p-6 lg:p-8`.
6. **`loading.tsx`** en CADA ruta del dashboard para skeletons.
