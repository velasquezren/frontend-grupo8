# 🎯 Lucide Icons — Catálogo para Banca

> Referencia rápida de iconos `lucide-react` organizados por uso bancario.
> Import: `import { IconName } from 'lucide-react'`
> Tamaño estándar: `className="h-4 w-4"` (en texto) o `h-5 w-5` (standalone)

## Navegación & UI

| Icono | Import | Uso |
|-------|--------|-----|
| 📊 | `LayoutDashboard` | Dashboard/inicio |
| 💳 | `CreditCard` | Cuentas bancarias |
| ↔️ | `ArrowLeftRight` | Transferencias |
| 🕐 | `Clock` | Historial/movimientos |
| 👤 | `User` | Perfil |
| ⚙️ | `Settings` | Configuración |
| 🚪 | `LogOut` | Cerrar sesión |
| 🔔 | `Bell` | Notificaciones |
| 🔍 | `Search` | Búsqueda |
| ☰ | `Menu` | Menú hamburguesa |
| ✕ | `X` | Cerrar |
| ← | `ArrowLeft` | Volver |
| → | `ArrowRight` | Siguiente |
| ↗ | `ExternalLink` | Link externo |
| ⋮ | `MoreVertical` | Menú contextual |
| ⋯ | `MoreHorizontal` | Acciones |

## Finanzas & Transacciones

| Icono | Import | Uso |
|-------|--------|-----|
| 💰 | `DollarSign` | Monto/dinero |
| 📈 | `TrendingUp` | Tendencia positiva |
| 📉 | `TrendingDown` | Tendencia negativa |
| 🏦 | `Building2` | Banco/institución |
| 💵 | `Banknote` | Efectivo |
| 🧾 | `Receipt` | Recibo |
| 📊 | `BarChart3` | Gráficas |
| 🔄 | `RefreshCw` | Actualizar/recarga |
| ↓ | `ArrowDownLeft` | Dinero recibido |
| ↑ | `ArrowUpRight` | Dinero enviado |
| 📤 | `Send` | Enviar transferencia |
| 🏷️ | `Tag` | Categoría |
| 📑 | `FileText` | Documento/estado |
| 📥 | `Download` | Descargar |
| 🖨️ | `Printer` | Imprimir |

## Estados & Feedback

| Icono | Import | Uso |
|-------|--------|-----|
| ✅ | `Check` | Éxito/completado |
| ✅✅ | `CheckCircle2` | Verificado |
| ⚠️ | `AlertTriangle` | Advertencia |
| ❌ | `XCircle` | Error |
| ℹ️ | `Info` | Información |
| ⏳ | `Loader2` | Loading (animar con `animate-spin`) |
| 🔒 | `Lock` | Seguridad/bloqueado |
| 🔓 | `Unlock` | Desbloqueado |
| 👁️ | `Eye` | Mostrar |
| 👁️‍🗨️ | `EyeOff` | Ocultar |
| 🛡️ | `Shield` | Seguridad |
| ✨ | `Sparkles` | Premium/nuevo |

## Acciones CRUD

| Icono | Import | Uso |
|-------|--------|-----|
| ➕ | `Plus` | Crear/agregar |
| ✏️ | `Pencil` | Editar |
| 🗑️ | `Trash2` | Eliminar |
| 📋 | `Copy` | Copiar |
| 📎 | `Paperclip` | Adjuntar |
| 📁 | `Folder` | Carpeta |
| ⭐ | `Star` | Favorito |
| ❤️ | `Heart` | Favorito alt |
| 📌 | `Pin` | Fijar |

## Patrones de Uso

### Botón con icono
```tsx
<Button><Plus className="h-4 w-4 mr-2" />Nueva cuenta</Button>
```

### Icono solo (botón)
```tsx
<Button variant="ghost" size="icon">
  <Bell className="h-4 w-4" />
  <span className="sr-only">Notificaciones</span>
</Button>
```

### Loading spinner
```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

### Indicador de tendencia
```tsx
{trend > 0 ? (
  <TrendingUp className="h-4 w-4 text-green-500" />
) : (
  <TrendingDown className="h-4 w-4 text-red-500" />
)}
```

### En listas/tablas
```tsx
<div className="flex items-center gap-2">
  <ArrowUpRight className="h-4 w-4 text-red-500" />
  <span>Transferencia enviada</span>
</div>
```

## Reglas

1. **SOLO** usar `lucide-react`. No mezclar con otras librerías.
2. Tamaño estándar: `h-4 w-4` (16px). Máximo `h-5 w-5` (20px).
3. Color: heredar del parent o usar `text-muted-foreground`.
4. Siempre agregar `<span className="sr-only">` para accesibilidad en icon buttons.
5. Loading: SIEMPRE usar `Loader2` con `animate-spin`.
