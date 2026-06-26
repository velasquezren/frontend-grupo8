# ⚡ Next.js 16 — Patrones y APIs

> **IMPORTANTE**: Next.js 16 tiene breaking changes respecto a versiones anteriores. SIEMPRE consultar `node_modules/next/dist/docs/` antes de escribir código.

## Server Components (Default)

Todos los componentes en `app/` son Server Components por defecto. Pueden:
- Hacer `async/await` directamente
- Acceder a DB, APIs, secrets
- NO pueden usar hooks, event handlers, ni browser APIs

```tsx
// app/page.tsx — Server Component (default)
export default async function Page() {
  const data = await fetchData() // ← directo, sin useEffect
  return <div>{data.title}</div>
}
```

## Client Components

Agregar `'use client'` al inicio del archivo cuando necesites:
- `useState`, `useEffect`, `useContext`
- Event handlers: `onClick`, `onChange`
- Browser APIs: `localStorage`, `window`
- Librerías client-only: `motion`, `react-hook-form`

```tsx
'use client'
import { useState } from 'react'
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

## Layouts y Pages

### Root Layout (obligatorio)
```tsx
// app/layout.tsx — DEBE tener <html> y <body>
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es"><body>{children}</body></html>
  )
}
```

### Layouts Anidados
```tsx
// app/(dashboard)/layout.tsx — NO re-renderiza entre páginas
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

## Params — BREAKING CHANGE v16

En Next.js 16, `params` y `searchParams` son **Promises**. DEBEN usar `await`:

```tsx
// ✅ Next.js 16 — params es Promise
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <div>ID: {id}</div>
}

// ✅ searchParams también es Promise
export default async function Page({
  searchParams
}: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { query } = await searchParams
}
```

### PageProps y LayoutProps (helpers globales)
```tsx
// No requieren import — son tipos globales generados por next dev/build
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
}

export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}</section>
}
```

## Navegación

### Link Component
```tsx
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
<Link href={`/cuentas/${id}`}>Ver cuenta</Link>
<Link href="/login" prefetch={false}>Login</Link>  // Sin prefetch
```

### useRouter (Client Components)
```tsx
'use client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  return <button onClick={() => router.push('/login')}>Salir</button>
}
```

### redirect (Server Actions)
```tsx
'use server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  // ... autenticar
  redirect('/dashboard')
}
```

## Server Actions (Mutaciones)

```tsx
// app/lib/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTransfer(formData: FormData) {
  const amount = formData.get('amount')
  // ... validar, ejecutar
  revalidatePath('/movimientos')
  redirect('/movimientos')
}
```

### Uso en formularios
```tsx
// Server Component — form nativo
import { createTransfer } from '@/app/lib/actions'

export function TransferForm() {
  return (
    <form action={createTransfer}>
      <input name="amount" type="number" />
      <button type="submit">Transferir</button>
    </form>
  )
}
```

### Pending State
```tsx
'use client'
import { useActionState } from 'react'
import { createTransfer } from '@/app/lib/actions'

export function TransferButton() {
  const [state, action, pending] = useActionState(createTransfer, null)
  return (
    <button onClick={action} disabled={pending}>
      {pending ? 'Procesando...' : 'Transferir'}
    </button>
  )
}
```

## Loading UI (Streaming)

Crear `loading.tsx` en cada ruta dinámica. Next.js lo envuelve en `<Suspense>` automáticamente:

```tsx
// app/(dashboard)/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
```

## Error Handling

```tsx
// app/(dashboard)/error.tsx — DEBE ser 'use client'
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-xl font-semibold">Algo salió mal</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

## Instant Navigation (Next.js 16 nuevo)

Para navegaciones instantáneas, exportar `unstable_instant` + usar `<Suspense>`:

```tsx
export const unstable_instant = { prefetch: 'static' }

import { Suspense } from 'react'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <Content params={params} />
    </Suspense>
  )
}
```

## Context Providers

Los providers de contexto DEBEN ser Client Components, montados en el layout:

```tsx
// app/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'
export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

## Refresh Data (Next.js 16)

```tsx
'use server'
import { refresh } from 'next/cache' // ← NO confundir con revalidatePath

export async function updateAccount() {
  // ... mutar datos
  refresh() // Refresca la página actual
}
```

## Reglas Críticas

1. `params` y `searchParams` son **Promises** — SIEMPRE `await`
2. `'use client'` SOLO donde se necesite interactividad
3. Server Actions SIEMPRE validan auth: `const session = await auth()`
4. `loading.tsx` en TODA ruta dinámica
5. `error.tsx` SIEMPRE con `'use client'`
6. Consultar `node_modules/next/dist/docs/01-app/` para APIs actualizadas
