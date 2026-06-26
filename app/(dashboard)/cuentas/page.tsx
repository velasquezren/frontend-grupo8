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
  Pencil, Trash2, DollarSign,
} from 'lucide-react'
import { MOCK_ACCOUNTS } from '@/lib/data'
import { formatCurrency, generateAccountNumber, generateId } from '@/lib/utils'
import { ACCOUNT_STATES, ACCOUNT_TYPES } from '@/lib/constants'
import type { Account } from '@/types'
import { toast } from 'sonner'

export default function CuentasPage() {
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS)
  useEffect(() => {
    document.title = 'Cuentas | Banca Simplificada'
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
      a.titular.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.numeroCuenta.includes(searchQuery) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
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
    setFormEmail(account.email)
    setFormTipo(account.tipo)
    setFormSaldo(String(account.saldo))
    setDialogOpen(true)
  }

  function handleSave() {
    if (!formTitular.trim() || !formEmail.trim()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingAccount.id
            ? { ...a, titular: formTitular, email: formEmail, tipo: formTipo, saldo: Number(formSaldo) || a.saldo }
            : a
        )
      )
      toast.success(`Cuenta de ${formTitular} actualizada`)
    } else {
      const newAccount: Account = {
        id: generateId(),
        titular: formTitular,
        email: formEmail,
        numeroCuenta: generateAccountNumber(),
        tipo: formTipo,
        saldo: Number(formSaldo) || 0,
        moneda: 'BOB',
        estado: 'activa',
        creadaEn: new Date().toISOString(),
      }
      setAccounts((prev) => [newAccount, ...prev])
      toast.success(`Cuenta creada para ${formTitular}`)
    }

    setDialogOpen(false)
    resetForm()
  }

  function handleDelete(account: Account) {
    setAccounts((prev) => prev.filter((a) => a.id !== account.id))
    toast.success(`Cuenta de ${account.titular} eliminada`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cuentas" description="Gestiona las cuentas bancarias de la plataforma">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger render={
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}</DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Modifica los datos de la cuenta.' : 'Ingresa los datos del nuevo titular.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titular">Titular</Label>
                <Input id="titular" placeholder="Nombre completo" value={formTitular} onChange={(e) => setFormTitular(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Cuenta</Label>
                  <Select value={formTipo} onValueChange={(v) => setFormTipo((v || 'ahorro') as 'ahorro' | 'corriente')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahorro">Ahorro</SelectItem>
                      <SelectItem value="corriente">Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo Inicial</Label>
                  <Input id="saldo" type="number" step="0.01" min="0" placeholder="0.00" value={formSaldo} onChange={(e) => setFormSaldo(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>Cancelar</Button>
              <Button onClick={handleSave}>{editingAccount ? 'Guardar Cambios' : 'Crear Cuenta'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Saldo Total" value={formatCurrency(totalBalance)} icon={DollarSign} />
        <StatCard title="Cuentas Activas" value={String(activeCount)} icon={CreditCard} description={`De ${accounts.length} registradas`} />
        <StatCard title="Cuentas Totales" value={String(accounts.length)} icon={Wallet} />
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Listado de Cuentas</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por titular, cuenta o email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titular</TableHead>
                <TableHead className="hidden md:table-cell">Nro. Cuenta</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => {
                const stateConfig = ACCOUNT_STATES[account.estado]
                return (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{account.titular}</p>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{account.numeroCuenta}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{ACCOUNT_TYPES[account.tipo]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stateConfig.variant}>{stateConfig.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-semibold text-sm">
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
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            } />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
                                <AlertDialogDescription>
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
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron cuentas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
