import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet, Shield, Zap, ArrowLeftRight } from 'lucide-react'

export const metadata = {
  title: 'Billetera Digital',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">Banca Simplificada</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/dashboard">Iniciar Sesión</Link>} />
            <Button render={
              <Link href="/dashboard">
                Comenzar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            } />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="mr-2 h-3 w-3 text-primary" />
              Billetera digital del Grupo 8
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tu dinero,{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                simplificado
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Abre cuentas, transfiere fondos entre usuarios de la plataforma y
              recibe notificaciones en tiempo real. Todo validado y seguro.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" render={
                <Link href="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              } />
              <Button size="lg" variant="outline" render={<Link href="/cuentas">Ver Cuentas</Link>} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-20">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Gestión de Cuentas</h3>
                <p className="text-sm text-muted-foreground">
                  Crea y administra cuentas de ahorro y corriente. CRUD completo con validación de datos.
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Transferencias Validadas</h3>
                <p className="text-sm text-muted-foreground">
                  Transferencias entre cuentas con validación de saldo. Si no alcanza, se rechaza automáticamente.
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Alertas en Tiempo Real</h3>
                <p className="text-sm text-muted-foreground">
                  Notificaciones automáticas para ambas partes y alertas especiales para montos elevados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Grupo 8 — Banca Simplificada · Proyecto de Microservicios con NATS
        </div>
      </footer>
    </div>
  )
}
