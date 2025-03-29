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
  if (number === 0 || !number) return '0';
  
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  
  return number.toLocaleString();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

