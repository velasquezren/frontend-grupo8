import { getAccounts, getTransfers } from '@/lib/data'
import { TransferenciasClient } from '@/components/features/transferencias/transferencias-client'

export const metadata = {
  title: 'Transferencias | Banca Simplificada',
  description: 'Envía fondos de forma instantánea entre cuentas de la plataforma',
}

export default async function TransferenciasPage() {
  const accounts = getAccounts()
  const transfers = getTransfers()

  return (
    <TransferenciasClient
      initialAccounts={accounts}
      initialTransfers={transfers}
    />
  )
}
