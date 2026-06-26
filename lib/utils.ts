import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'BOB'): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function generateAccountNumber(): string {
  const seg1 = '0010'
  const seg2 = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  const seg3 = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${seg1}-${seg2}-${seg3}`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9).toUpperCase()
}
