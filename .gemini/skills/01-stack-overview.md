# 🏗️ Stack Tecnológico — Banca Simplificada

> Guía maestra del stack completo. Cada librería fue elegida para maximizar la **sinergia visual**, el **rendimiento** y la **experiencia de desarrollo**.

## Versiones Core

| Paquete | Versión | Rol |
|---------|---------|-----|
| Next.js | **16.x** (App Router) | Framework fullstack |
| React | **19.x** | UI runtime |
| TypeScript | **5.x** | Seguridad de tipos |
| Tailwind CSS | **4.x** | Utilidades CSS |

## Librerías del Proyecto

### 🎨 UI Components — `shadcn/ui`
- **No es una dependencia de npm**. Se copia el código fuente al proyecto con `npx shadcn@latest add <componente>`.
- Basado en **Base UI** (`@base-ui/react`) para accesibilidad + **Tailwind CSS** para estilos.
- Directorio: `components/ui/`
- Alias: `@/components/ui/button`
- **IMPORTANTE**: Usa la prop `render` en vez de `asChild` para composición de componentes.

### 🎭 Iconos — `lucide-react`
- Integración nativa con shadcn/ui.
- Iconos SVG stroke-based, tree-shakable.
- Uso: `import { Home, CreditCard, ArrowRight } from 'lucide-react'`
- **Consistencia**: Usar solo lucide-react en todo el proyecto. NO mezclar con otras librerías de iconos.

### ✨ Animaciones — `motion` (Framer Motion)
- API declarativa nativa para React.
- Uso para: transiciones de página, micro-interacciones, hover effects, modales.
- `AnimatePresence` para exit animations.
- **Regla**: Siempre usar `'use client'` en componentes con motion.

### 📝 Formularios — `react-hook-form` + `zod`
- `react-hook-form`: Uncontrolled forms, mínimo re-render.
- `zod`: Schemas de validación type-safe.
- Resolver: `@hookform/resolvers/zod`
- Para Server Actions simples, usar `<form action={serverAction}>` nativo + Zod directamente.

### 🗄️ Estado
- **Server state**: Next.js Server Components + `fetch` nativo (NO necesitas TanStack Query si solo usas Server Components).
- **Client state simple**: `useState`, `useContext`.
- **Client state global** (si se necesita): `zustand` — store minimalista sin providers.

### 🔔 Notificaciones — `sonner`
- Toast moderno, integrado con shadcn/ui.
- Uso: `toast.success('Transferencia exitosa')`
- Montar `<Toaster />` en el root layout.

### 📊 Tipografía — `next/font/google`
- Fuentes: **Geist** (sans) + **Geist Mono** (mono) — ya configuradas.
- Auto-hosted, zero layout shift.
- Variables CSS: `--font-geist-sans`, `--font-geist-mono`.
- Mapping en `globals.css`: `--font-sans: var(--font-geist-sans)`.

## Reglas del Stack

1. **NUNCA mezclar** librerías de iconos. Solo `lucide-react`.
2. **NUNCA usar** `useEffect` para data fetching. Usar Server Components.
3. **SIEMPRE** poner `'use client'` cuando uses hooks, event handlers, o motion.
4. **SIEMPRE** usar el alias `@/` para imports.
5. **SIEMPRE** consultar `node_modules/next/dist/docs/` antes de usar APIs de Next.js 16.
6. **PREFERIR** Server Components por defecto. Solo usar Client Components para interactividad.
7. **NUNCA usar** `asChild`. Usar la prop `render` para composición (ej: `<Button render={<Link href="/" />} />`).
8. **Select `onValueChange`** retorna `string | null` — siempre añadir fallback: `(v) => set(v || default)`.
