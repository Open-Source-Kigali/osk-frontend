import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names, filtering out falsy values and merging Tailwind classes.
 * Usage: cn("base", condition && "extra", "always")
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns initials from a full name.
 * "Didas Mbarushimana Daniel" → "DD"
 */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, maxChars)
    .toUpperCase();
}

/**
 * Picks a deterministic avatar color from a name.
 * Always returns the same color for the same name.
 */
const AVATAR_COLORS = [
  "#2b7fff",
  "#1a6fef",
  "#0a5fdf",
  "#5b9fff",
  "#3b82f6",
  "#1d4ed8",
];

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

/**
 * Truncates a string and appends "…" if it exceeds maxLength.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Slugifies a string.
 * "Kigali Community Hub" → "kigali-community-hub"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Returns percentage filled, capped at 100.
 * Used by AttendeeBar and event cards.
 */
export function fillPercent(
  filled: number,
  total: number | null
): number {
  if (!total) return 0;
  return clamp(Math.round((filled / total) * 100), 0, 100);
}

/**
 * Returns true if a URL is external (starts with http/https).
 */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Groups an array of objects by a key.
 * groupBy(projects, "category")
 * → { platform: [...], health: [...] }
 */
export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * Removes duplicates from an array of primitives.
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Sorts an array of objects by a key.
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}