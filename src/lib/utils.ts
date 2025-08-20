import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to clean data (converted from Python)
export function cleanField(value: unknown): string | null {
  if (value === null || value === undefined || value === "N.d." || value === "=" || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}

// Generate UUID (replacement for Python uuid.uuid4())
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
