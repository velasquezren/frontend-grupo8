# 📁 Estructura del Proyecto — Banca Simplificada

> Convención de archivos y carpetas para Next.js 16 App Router. Seguir esta estructura garantiza **navegación coherente** y **sinergia visual** entre páginas.

## Árbol de Directorios

```
banca/
├── app/
│   ├── globals.css                  # Design tokens + Tailwind config
│   ├── layout.tsx                   # Root Layout (fuentes, providers, metadata)
│   ├── page.tsx                     # Landing / Home
│   ├── loading.tsx                  # Root loading skeleton
│   ├── not-found.tsx                # 404 global
│   ├── error.tsx                    # Error boundary global
│   │
│   ├── (auth)/                      # Route Group — páginas sin sidebar
│   │   ├── layout.tsx               # Layout centrado (login/register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/                 # Route Group — páginas con sidebar
│   │   ├── layout.tsx               # Layout con Sidebar + Header
│   │   ├── dashboard/page.tsx       # Panel principal
│   │   ├── cuentas/page.tsx         # Cuentas bancarias
│   │   ├── transferencias/page.tsx  # Transferencias
│   │   ├── movimientos/page.tsx     # Historial de movimientos
│   │   └── perfil/page.tsx          # Perfil del usuario
│   │
│   └── api/                         # Route Handlers (API endpoints)
│       └── [...]/route.ts
│
├── components/
│   ├── ui/                          # shadcn/ui components (auto-generados)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── layout/                      # Componentes de layout reutilizables
│   │   ├── sidebar.tsx              # Sidebar de navegación
│   │   ├── header.tsx               # Header con usuario + notificaciones
│   │   ├── mobile-nav.tsx           # Nav móvil (Sheet)
│   │   └── footer.tsx               # Footer
│   │
│   ├── shared/                      # Componentes compartidos
│   │   ├── page-header.tsx          # Título + descripción de cada página
│   │   ├── data-table.tsx           # Tabla de datos reutilizable
│   │   ├── stat-card.tsx            # Card de estadísticas
│   │   ├── empty-state.tsx          # Estado vacío
│   │   └── loading-skeleton.tsx     # Skeletons reutilizables
│   │
│   └── features/                    # Componentes específicos por feature
│       ├── dashboard/
│       ├── cuentas/
│       ├── transferencias/
│       └── movimientos/
│
├── lib/                             # Utilidades y lógica compartida
│   ├── utils.ts                     # cn() helper + utilidades generales
│   ├── validations.ts               # Schemas de Zod
│   └── constants.ts                 # Constantes (rutas de nav, etc.)
│
├── hooks/                           # Custom hooks
│   └── use-mobile.ts                # Hook para detectar mobile
│
├── public/                          # Assets estáticos
│   └── ...
│
└── types/                           # TypeScript types
    └── index.ts
```

## Convenciones de Archivos Next.js 16

| Archivo | Propósito |
|---------|-----------|
| `layout.tsx` | UI compartida entre rutas hijas. NO re-renderiza en navegación |
| `page.tsx` | UI única de la ruta. DEBE ser default export |
| `loading.tsx` | Skeleton automático vía `<Suspense>`. **CRÍTICO para navegación instant** |
| `error.tsx` | Error boundary. DEBE tener `'use client'` |
| `not-found.tsx` | UI para 404 |
| `route.ts` | API endpoint (GET, POST, PUT, DELETE) |

## Route Groups `(nombre)`

- Los paréntesis `()` crean grupos lógicos SIN afectar la URL.
- `(auth)` agrupa login/register con un layout centrado.
- `(dashboard)` agrupa todas las páginas del dashboard con sidebar.
- Esto permite **layouts diferentes** para distintas secciones sin rutas anidadas.

## Regla de Layouts Anidados

```
Root Layout (app/layout.tsx)
  ├── (auth)/layout.tsx      → Layout centrado, sin nav
  └── (dashboard)/layout.tsx → Layout con sidebar, header
        ├── dashboard/page.tsx
        ├── cuentas/page.tsx
        └── ...
```

> **IMPORTANTE**: Cada layout persiste su estado durante la navegación. El sidebar y header NO se re-renderizan cuando el usuario navega entre páginas del dashboard.

## Imports con Alias

```typescript
// ✅ Correcto — usar SIEMPRE el alias @/
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/sidebar'

// ❌ Incorrecto — NUNCA usar paths relativos profundos
import { Button } from '../../../components/ui/button'
```

## Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos de componente | kebab-case | `stat-card.tsx` |
| Componentes React | PascalCase | `StatCard` |
| Hooks | camelCase con "use" | `useMobile` |
| Utilidades | camelCase | `formatCurrency` |
| Types/Interfaces | PascalCase | `Transaction` |
| Constantes | UPPER_SNAKE_CASE | `NAV_ITEMS` |
