import { TransferenciasClient } from '@/components/features/transferencias/transferencias-client'

export const metadata = {
  title: 'Transferencias | Banca Simplificada',
  description: 'Envía fondos de forma instantánea entre cuentas de la plataforma',
}

export default function TransferenciasPage() {
  return (
    <TransferenciasClient
      initialAccounts={[]}
      initialTransfers={[]}
    />
  )
}
