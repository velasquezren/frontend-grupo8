# ✅ Checklist de Calidad — Banca Simplificada

> Verificar ANTES de dar por terminada cualquier página o componente.

## Checklist por Página

### Estructura
- [ ] Tiene `export const metadata = { title: '...' }` para SEO
- [ ] Sigue el patrón: PageHeader → Stats → Content
- [ ] Usa `space-y-6` o `space-y-8` para espaciado vertical
- [ ] Padding responsivo: `p-4 md:p-6 lg:p-8`

### Loading & Error
- [ ] Tiene `loading.tsx` con Skeletons matching
- [ ] Los skeletons replican la estructura real de la página
- [ ] Tiene `error.tsx` con `'use client'` y botón de retry

### Componentes
- [ ] Solo usa componentes de `@/components/ui/` (shadcn)
- [ ] Solo usa iconos de `lucide-react`
- [ ] `'use client'` SOLO donde hay interactividad
- [ ] Props tipadas con TypeScript interfaces

### Accesibilidad
- [ ] Botones de icono tienen `<span className="sr-only">`
- [ ] Formularios usan `<Label>` vinculado a inputs
- [ ] Colores de contraste suficiente (WCAG AA mínimo)
- [ ] Navegación por teclado funcional

### Responsive
- [ ] Funciona en mobile (320px+)
- [ ] Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- [ ] Sidebar se oculta en mobile → Sheet/drawer
- [ ] Tablas son scrollables en mobile

### Sinergia Visual
- [ ] Usa la misma paleta de colores (CSS variables)
- [ ] Misma tipografía (Geist Sans/Mono)
- [ ] Montos en `font-mono tabular-nums`
- [ ] Badges consistentes para estados
- [ ] Animaciones sutiles (no excesivas)
- [ ] Dark mode funcional y testeado

### Performance
- [ ] Server Components por defecto
- [ ] Client Components solo donde se necesitan
- [ ] Imágenes con `next/image`
- [ ] Lazy loading donde aplique
- [ ] No hay `useEffect` para data fetching

### Seguridad (Server Actions)
- [ ] Valida auth en CADA Server Action
- [ ] Valida input con Zod
- [ ] No expone secrets al client
- [ ] `revalidatePath` o `redirect` después de mutaciones
