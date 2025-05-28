import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "approved":
      return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
    case "rejected":
      return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"
    case "pending":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400"
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
  }
}
