# 🎨 Design System — Banca Simplificada

> Minimalista, estético, dark-first. Confianza bancaria premium con paleta teal.

## Filosofía

1. **Minimalismo funcional** — Cada elemento tiene propósito
2. **Dark-first** — Modo oscuro como default
3. **Micro-animaciones sutiles** — Dan vida sin distraer
4. **Consistencia total** — Mismos patrones en TODAS las páginas

## Paleta de Colores (oklch en CSS Variables)

> Los colores usan el formato `oklch(lightness chroma hue)` en `globals.css`.

### Light Mode
- `--background: oklch(0.985 0.002 247)` — Blanco ligeramente azulado
- `--foreground: oklch(0.145 0.005 247)` — Casi negro
- `--primary: oklch(0.47 0.13 173)` — **Teal profesional** (identidad bancaria)
- `--primary-foreground: oklch(0.985 0.002 173)` — Blanco sobre teal
- `--accent: oklch(0.94 0.02 173)` — Teal muy sutil
- `--muted: oklch(0.965 0.005 247)` — Gris claro azulado
- `--destructive: oklch(0.577 0.245 27.325)` — Rojo para errores
- `--ring: oklch(0.47 0.13 173)` — Mismo teal que primary

### Dark Mode (`.dark`)
- `--background: oklch(0.155 0.012 250)` — Navy profundo
- `--foreground: oklch(0.94 0.005 247)` — Blanco suave
- `--primary: oklch(0.68 0.15 173)` — **Teal vibrante**
- `--card: oklch(0.195 0.014 250)` — Navy ligeramente más claro
- `--accent: oklch(0.25 0.03 173)` — Teal oscuro
- `--ring: oklch(0.68 0.15 173)` — Mismo teal que primary

### Colores Semánticos (Tailwind directo, no variables)
- Éxito: `text-emerald-500` / `bg-emerald-500/10`
- Error: `text-red-500` / `bg-red-500/10`
- Warning: `text-amber-500`

## Tipografía

- Sans: `var(--font-geist-sans)` → Tailwind `font-sans` — Headings + Body
- Mono: `var(--font-geist-mono)` → Tailwind `font-mono` — Números, montos, códigos

| Uso | Tailwind | Peso |
|-----|----------|------|
| H1 (PageHeader) | `text-2xl font-bold tracking-tight md:text-3xl` | 700 |
| H2 (CardTitle) | `text-base font-semibold` | 600 |
| H3 | `text-lg font-semibold` | 600 |
| Body | `text-sm` | 400 |
| Caption | `text-xs text-muted-foreground` | 400 |
| Montos | `font-mono text-2xl font-bold tabular-nums` | 700 |
| Cuenta # | `font-mono text-xs text-muted-foreground` | 400 |

## Espaciado

- Gap cards: `gap-4` o `gap-6`
- Padding contenido: `p-4 md:p-6`
- Entre secciones: `space-y-6`
- Grid stats: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`

## Componentes Reutilizables

### PageHeader — `components/shared/page-header.tsx`
```tsx
<PageHeader title="Dashboard" description="Resumen de tu billetera digital">
  <Button render={<Link href="/transferencias">Nueva Transferencia</Link>} />
</PageHeader>
```

### StatCard — `components/shared/stat-card.tsx`
```tsx
<StatCard
  title="Saldo Total"
  value={formatCurrency(totalBalance)}
  icon={Wallet}
  trend={{ value: 12.5, positive: true }}
/>
```

### EmptyState — `components/shared/empty-state.tsx`
```tsx
<EmptyState
  icon={Inbox}
  title="Sin movimientos"
  description="Aún no hay movimientos registrados."
  action={<Button>Crear cuenta</Button>}
/>
```

## Micro-Animaciones

### CSS (Tailwind)
```
transition-colors duration-200       ← hover en botones/links
transition-shadow duration-200       ← hover en cards
hover:bg-muted/50                    ← hover en rows
hover:shadow-md                      ← hover en stat cards
```

## Formato de Montos
```typescript
export function formatCurrency(amount: number, currency = 'BOB'): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(amount)
}
// Uso: <span className="font-mono tabular-nums">{formatCurrency(balance)}</span>
```

## Reglas
1. Dark mode primero
2. Gradientes solo en CTA/hero
3. Bordes sutiles: `border-border`
4. Números siempre `font-mono tabular-nums`
5. Iconos `h-4 w-4` o `h-5 w-5` — nunca más grande en UI (excepto hero/empty states)
6. Feedback visual en TODA acción (toast)
7. Colores via CSS variables — NUNCA hardcodear hex/rgb
