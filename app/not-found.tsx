import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
        <HelpCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Página no encontrada</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        La página que buscas no existe o ha sido movida a otra ubicación.
      </p>
      <Button render={<Link href="/dashboard">Volver al Dashboard</Link>} />
    </div>
  )
}
