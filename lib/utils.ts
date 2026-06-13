import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const p = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12).getTime();
  };
  return Math.floor((p(to) - p(from)) / 86400000);
}
