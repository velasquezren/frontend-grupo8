import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Shield, Calendar } from 'lucide-react'

export const metadata = { title: 'Perfil' }

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" description="Información de tu cuenta" />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 backdrop-blur-md shadow-lg">
          <CardContent className="flex flex-col items-center pt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-md scale-110 pointer-events-none" />
              <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">JP</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Juan Pérez</h2>
              <p className="text-xs font-mono uppercase tracking-widest text-primary font-medium">Administrador</p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-none relative pl-5 text-[10px]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
              </span>
              Cuenta Activa
            </Badge>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="md:col-span-2 backdrop-blur-md shadow-lg">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Información Personal</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Datos asociados a tu perfil</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Nombre completo</p>
                <p className="text-sm font-bold text-foreground">Juan Pérez</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Correo electrónico</p>
                <p className="text-sm font-bold text-foreground">juan@email.com</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Rol</p>
                <p className="text-sm font-bold text-foreground">Administrador de Plataforma</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Miembro desde</p>
                <p className="text-sm font-bold text-foreground">Enero 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
