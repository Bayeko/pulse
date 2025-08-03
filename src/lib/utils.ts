import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateConnectCode(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()
}
