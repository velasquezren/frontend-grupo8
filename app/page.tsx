import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet, Shield, Zap, ArrowLeftRight } from 'lucide-react'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Banca Simplificada — Billetera Digital',
  description: 'Tu dinero, simplificado. Gestiona cuentas, realiza transferencias validadas y recibe alertas en tiempo real.',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[110px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Nav Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Banca Simplificada
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors"
              render={<Link href="/dashboard">Iniciar Sesión</Link>}
            />
            <Button
              className="shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_25px_rgba(20,184,166,0.4)] transition-all"
              render={
                <Link href="/dashboard">
                  Comenzar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              }
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 z-10">
        <section className="container mx-auto px-4 py-20 md:py-28 lg:py-32 grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary font-mono font-medium tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary animate-pulse" />
              Billetera digital del Grupo 8 — Arquitectura de Microservicios
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-none">
              Tu dinero,{' '}
              <span className="bg-gradient-to-r from-primary via-teal-500 to-emerald-500 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                simplificado
              </span>
            </h1>

            <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Administra cuentas en tiempo real, transfiere fondos de manera segura
              y audita transacciones mediante mensajería distribuida con NATS.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_35px_rgba(20,184,166,0.45)] hover:scale-[1.02] transition-all"
                render={
                  <Link href="/dashboard">
                    Ir al Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="hover:scale-[1.02] transition-all"
                render={<Link href="/cuentas">Ver Cuentas</Link>}
              />
            </div>
          </div>

          {/* Interactive Credit Card Widget in Hero */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/5 border border-primary/20 p-6 shadow-[0_0_50px_rgba(20,184,166,0.15)] flex flex-col justify-between backdrop-blur-md overflow-hidden group hover:border-primary/40 transition-all duration-500">
              <div className="absolute -inset-px bg-gradient-to-r from-transparent via-primary/10 to-transparent group-hover:via-primary/30 transition-all duration-1000" />
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-primary font-mono font-bold">Banca Simplificada</p>
                  <p className="text-sm font-semibold tracking-tight text-foreground">Juan Pérez</p>
                </div>
                <div className="h-8 w-10 bg-muted/50 rounded-md backdrop-blur-md flex items-center justify-center border border-border shadow-inner">
                  <Wallet className="size-4 text-primary" />
                </div>
              </div>
              <div className="space-y-4 z-10">
                <p className="text-xl font-bold font-mono tracking-widest text-foreground">0010 · 0001 · 4532</p>
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-mono">Saldo Disponible</p>
                    <p className="text-2xl font-bold font-mono text-primary tabular-nums">Bs. 125.450,75</p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="relative mr-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    AHORROS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid Section */}
        <section className="border-t border-border bg-muted/30 dark:bg-muted/10 py-24">
          <div className="container mx-auto px-4 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Diseñado para la era digital
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Un entorno simplificado pero robusto, impulsado por validaciones estrictas y una arquitectura desacoplada.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2 max-w-5xl mx-auto">
              {/* Feature 1: Account Management */}
              <div className="md:col-span-2 bg-card border border-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between gap-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Wallet className="size-4" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">Gestión de Cuentas</h3>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Crea y administra cuentas corrientes y de ahorro con total transparencia. Modifica el estado del titular de forma instantánea.
                    </p>
                  </div>
                  {/* Visual card item inside bento */}
                  <div className="bg-background border border-border rounded-xl p-4 w-full md:w-64 shadow-2xl space-y-3 self-center">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground font-mono">CUENTA CORRIENTE</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">ACTIVA</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-foreground tracking-wide">Bs. 45.230,00</div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Security */}
              <div className="md:row-span-2 bg-card border border-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="size-4" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Transacciones Seguras</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Las transacciones se validan antes de ser procesadas. Si el saldo disponible no cumple con los requisitos del sistema, la operación es rechazada inmediatamente protegiendo los fondos.
                  </p>
                </div>
                <div className="border border-dashed border-border rounded-xl p-3 bg-muted/10 text-center font-mono text-[10px] text-muted-foreground space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] border-b border-border pb-1.5">
                    <span>TX_ID: T002</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">RECHAZADA</span>
                  </div>
                  <div className="text-left text-[9px] text-red-600 dark:text-red-400 leading-tight">
                    Motivo: Saldo insuficiente en cuenta de origen.
                  </div>
                </div>
              </div>

              {/* Feature 3: Transferencias */}
              <div className="bg-card border border-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ArrowLeftRight className="size-4" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">Transferencias Validadas</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Movimientos validados por saldo con registros inmutables de débito y crédito.
                  </p>
                </div>
              </div>

              {/* Feature 4: Alertas */}
              <div className="bg-card border border-border backdrop-blur-md rounded-2xl p-6 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="size-4" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">Alertas en Tiempo Real</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Notificaciones instantáneas de transferencias, con avisos automáticos para montos elevados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-background z-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            Grupo 8 — Banca Simplificada · Plataforma de Microservicios
          </div>
          <div className="flex gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer">Seguridad</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Soporte</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Auditoría</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
