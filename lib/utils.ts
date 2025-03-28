import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatNumber = (number: number): string => {
  return number.toLocaleString()
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

