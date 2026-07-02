'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, CreditCard, Wallet, Search, MoreHorizontal,
  Pencil, Trash2, DollarSign, Loader2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, generateAccountNumber, generateId } from '@/lib/utils'
import { ACCOUNT_STATES, ACCOUNT_TYPES } from '@/lib/constants'
import type { Account } from '@/types'
import { toast } from 'sonner'

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function loadAccounts() {
    setIsLoading(true)
    try {
      const data = await api.getAccounts()
      setAccounts(data)
    } catch (err: any) {
      console.error(err)
      toast.error('Error al cargar las cuentas desde el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Cuentas | Banca Simplificada'
    loadAccounts()
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  // Form state
  const [formTitular, setFormTitular] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formTipo, setFormTipo] = useState<'ahorro' | 'corriente'>('ahorro')
  const [formSaldo, setFormSaldo] = useState('')

  const filteredAccounts = accounts.filter(
    (a) =>
      a.titular?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.numeroCuenta?.includes(searchQuery) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalBalance = accounts.filter((a) => a.estado === 'activa').reduce((s, a) => s + a.saldo, 0)
  const activeCount = accounts.filter((a) => a.estado === 'activa').length

  function resetForm() {
    setFormTitular('')
    setFormEmail('')
    setFormTipo('ahorro')
    setFormSaldo('')
    setEditingAccount(null)
  }

  function openCreateDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(account: Account) {
    setEditingAccount(account)
    setFormTitular(account.titular)
    setFormEmail(account.email || '')
    setFormTipo(account.tipo)
    setFormSaldo(String(account.saldo))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formTitular.trim()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    try {
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          titular: formTitular,
          saldo: Number(formSaldo) || 0,
        })
        toast.success(`Cuenta de ${formTitular} actualizada`)
      } else {
        await api.createAccount({
          titular: formTitular,
          saldo: Number(formSaldo) || 0,
        })
        toast.success(`Cuenta creada para ${formTitular}`)
      }
      loadAccounts()
    } catch (err: any) {
      console.error(err)
      toast.error('Error al guardar la cuenta en el servidor')
    }

    setDialogOpen(false)
    resetForm()
  }

  async function handleDelete(account: Account) {
    try {
      await api.deleteAccount(account.id)
      toast.success(`Cuenta de ${account.titular} eliminada`)
      loadAccounts()
    } catch (err: any) {
      console.error(err)
      toast.error('Error al eliminar la cuenta del servidor')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cuentas" description="Gestiona las cuentas bancarias de la plataforma">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger render={
            <Button onClick={openCreateDialog} className="shadow-[0_0_15px_rgba(20,184,166,0.25)] hover:shadow-[0_0_25px_rgba(20,184,166,0.35)] transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bold">{editingAccount ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingAccount ? 'Modifica los datos de la cuenta.' : 'Ingresa los datos del nuevo titular.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titular" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titular</Label>
                <Input id="titular" placeholder="Nombre completo" value={formTitular} onChange={(e) => setFormTitular(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Cuenta</Label>
                  <Select value={formTipo} onValueChange={(v) => setFormTipo((v || 'ahorro') as 'ahorro' | 'corriente')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahorro">Ahorro</SelectItem>
                      <SelectItem value="corriente">Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Inicial</Label>
                  <Input id="saldo" type="number" step="0.01" min="0" placeholder="0.00" className="font-mono" value={formSaldo} onChange={(e) => setFormSaldo(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancelar</Button>
              <Button className="shadow-[0_0_15px_rgba(20,184,166,0.2)]" onClick={handleSave}>{editingAccount ? 'Guardar Cambios' : 'Crear Cuenta'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Saldo Total" value={formatCurrency(totalBalance)} icon={DollarSign} className="hover:border-primary/20 transition-all duration-300" />
        <StatCard title="Cuentas Activas" value={String(activeCount)} icon={CreditCard} description={`De ${accounts.length} registradas`} className="hover:border-primary/20 transition-all duration-300" />
        <StatCard title="Cuentas Totales" value={String(accounts.length)} icon={Wallet} className="hover:border-primary/20 transition-all duration-300" />
      </div>

      {/* Search + Table */}
      <Card className="backdrop-blur-md shadow-lg">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight">Listado de Cuentas</CardTitle>
              <p className="text-xs text-muted-foreground">Administra y filtra los estados de cuenta globales.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por titular, cuenta o email..."
                className="pl-9 placeholder:text-muted-foreground/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Titular</TableHead>
                <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nro. Cuenta</TableHead>
                <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>Cargando cuentas desde el servidor...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredAccounts.map((account) => {
                    const stateConfig = ACCOUNT_STATES[account.estado]
                    const isActive = account.estado === 'activa'
                    return (
                      <TableRow key={account.id} className="hover:bg-muted/50 border-border transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-bold text-sm text-foreground">{account.titular}</p>
                            <p className="text-xs text-muted-foreground">{account.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{account.numeroCuenta}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 text-muted-foreground">
                            {ACCOUNT_TYPES[account.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stateConfig.variant} className="relative pl-5 font-medium border-none py-0.5 text-[10px]">
                            <span className={`absolute left-2 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-400'}`}>
                              {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>}
                            </span>
                            {stateConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-bold text-sm text-primary">
                          {formatCurrency(account.saldo)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            } />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(account)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger render={
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                } />
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-bold">¿Eliminar cuenta?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs text-muted-foreground">
                                      Esta acción eliminará la cuenta de {account.titular} ({account.numeroCuenta}). No se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(account)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredAccounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-muted-foreground/30" />
                          <p>No se encontraron cuentas con el criterio de búsqueda.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
